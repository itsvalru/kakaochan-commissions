"use client";

import React, { useState, useEffect, useRef } from "react";
// import { FaPaperPlane, FaFile } from "react-icons/fa"; // Removed unused icons
import type { Commission, CommissionMessage } from "@/lib/types/types";
import {
  getCommissionMessages,
  createCommissionMessage,
  getCurrentUser,
} from "@/lib/supabase-client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  commission: Commission & {
    display_name?: string;
    avatar_url?: string | null;
  };
  userCommissions?: (Commission & { display_name?: string })[];
  allUsers?: {
    user: { id: string; display_name: string; avatar_url: string | null };
    commissions: (Commission & { display_name?: string })[];
  }[];
  allUsersForChat?: {
    user: { id: string; display_name: string; avatar_url: string | null };
    commissions: (Commission & { display_name?: string })[];
  }[];
  isAdmin: boolean;
}

// Global cache for messages and users
const messageCache = new Map<string, CommissionMessage[]>();
const userCache = new Map<
  string,
  { id: string; display_name: string; avatar_url: string | null }
>();
const userLoadingCache = new Set<string>();

export default function ChatWindow({
  commission,
  userCommissions,
  allUsers,
  allUsersForChat,
  isAdmin,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<CommissionMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-expanded-users");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const messagesContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const fileInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [showJumpToPresent, setShowJumpToPresent] = useState(false);
  const [infoCard, setInfoCard] = useState<{
    userId: string;
    anchorRect: DOMRect | null;
    displayName: string;
    avatarUrl: string | null;
    commissionCount?: number;
    isAdmin: boolean;
  } | null>(null);

  // Pagination state
  const PAGE_SIZE = 40;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<
    string | null
  >(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const hasAutoScrolled = useRef(false);
  const readyForScroll = useRef(false);

  // Track if we are loading older messages to suppress autoscroll
  const loadingOlderRef = useRef(false);
  const lastMessageCountRef = useRef(0);

  // Simple scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Make isAtBottom more forgiving
  const isAtBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    // Use a larger threshold
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  // Load messages with caching
  const loadMessages = async (commissionId: string) => {
    // Check cache first
    const cachedMessages = messageCache.get(commissionId);
    if (cachedMessages) {
      setMessages(cachedMessages);
      setInitialLoadComplete(true);
      setHasMore(cachedMessages.length >= PAGE_SIZE);
      setOldestMessageTimestamp(cachedMessages[0]?.created_at || null);
      return;
    }

    // If not cached, load from API
    setLoading(true);
    setInitialLoadComplete(false);
    setHasMore(true);
    setOldestMessageTimestamp(null);

    try {
      const [messagesData, currentUser] = await Promise.all([
        getCommissionMessages(commissionId, { limit: PAGE_SIZE }),
        getCurrentUser(),
      ]);

      setMessages(messagesData);
      setCurrentUserId(currentUser?.id || null);
      setHasMore(messagesData.length >= PAGE_SIZE);
      setOldestMessageTimestamp(messagesData[0]?.created_at || null);
      setInitialLoadComplete(true);

      // Cache the messages
      messageCache.set(commissionId, messagesData);
    } catch (e) {
      setError("Failed to load data");
      console.error("Load data error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch last PAGE_SIZE messages
  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      if (cancelled) return;
      await loadMessages(commission.id);
    };
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [commission.id]);

  // Reset auto-scroll on chat change
  useEffect(() => {
    hasAutoScrolled.current = false;
  }, [commission.id]);

  // Scroll to bottom only on the very first load or when chat changes (robust MutationObserver version)
  useEffect(() => {
    if (
      initialLoadComplete &&
      !loading &&
      messages.length > 0 &&
      !hasAutoScrolled.current
    ) {
      const el = messagesContainerRef.current;
      if (!el) return;

      // Scroll immediately in case DOM is ready
      scrollToBottom();

      // Set up a MutationObserver to scroll after DOM updates
      const observer = new MutationObserver(() => {
        scrollToBottom();
        hasAutoScrolled.current = true;
        readyForScroll.current = true;
        observer.disconnect();
      });

      observer.observe(el, { childList: true, subtree: true });

      // Fallback: disconnect after 1 second to avoid leaks
      const timeout = setTimeout(() => {
        observer.disconnect();
        readyForScroll.current = true;
      }, 1000);

      return () => {
        observer.disconnect();
        clearTimeout(timeout);
      };
    }
  }, [initialLoadComplete, loading, messages.length, commission.id]);

  // Scroll to bottom ONLY on initial load - never again after that
  useEffect(() => {
    if (
      initialLoadComplete &&
      !loading &&
      messages.length > 0 &&
      !hasAutoScrolled.current
    ) {
      scrollToBottom();
      hasAutoScrolled.current = true;
    }
  }, [initialLoadComplete, loading, messages.length]);

  // Auto-scroll to bottom when new messages come in and user is at bottom
  useEffect(() => {
    if (
      initialLoadComplete &&
      !loading &&
      messages.length > 0 &&
      hasAutoScrolled.current &&
      isAtBottom() &&
      !loadingOlderRef.current
    ) {
      // Only scroll if messages were added to the end (new messages), not prepended (older messages)
      if (messages.length > lastMessageCountRef.current) {
        scrollToBottom();
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, initialLoadComplete, loading]);

  // Infinite scroll: fetch older messages when near top
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const handleScroll = async () => {
      if (!readyForScroll.current) return;
      if (el.scrollTop < 64 && hasMore && !loadingMore && !loading) {
        loadingOlderRef.current = true;
        setLoadingMore(true);
        // Save the current scroll height
        const prevScrollHeight = el.scrollHeight;
        try {
          const older = await getCommissionMessages(commission.id, {
            limit: PAGE_SIZE,
            before: oldestMessageTimestamp || undefined,
          });
          if (older.length > 0) {
            const newMessages = [...older, ...messages];
            setMessages(newMessages);
            setOldestMessageTimestamp(older[0].created_at);
            setHasMore(older.length >= PAGE_SIZE);

            // Update cache
            messageCache.set(commission.id, newMessages);

            // Use requestAnimationFrame to ensure DOM has updated before adjusting scroll
            requestAnimationFrame(() => {
              const newScrollHeight = el.scrollHeight;
              const heightDifference = newScrollHeight - prevScrollHeight;
              // Adjust scrollTop by the height difference to maintain position
              el.scrollTop = heightDifference;
            });
          } else {
            setHasMore(false);
          }
        } catch (err) {
          setError("Failed to load older messages");
          console.error("Failed to load older messages:", err);
        } finally {
          setLoadingMore(false);
          loadingOlderRef.current = false;
        }
      }
      setShowJumpToPresent(!isAtBottom());
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [
    hasMore,
    loadingMore,
    loading,
    oldestMessageTimestamp,
    messages,
    commission.id,
  ]);

  // Real-time subscriptions (for new messages at the bottom)
  useEffect(() => {
    if (!commission.id) return;
    const messagesSubscription = supabase
      .channel(`commission_messages_${commission.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "commission_messages",
          filter: `commission_id=eq.${commission.id}`,
        },
        (payload) => {
          const newMessage = payload.new as CommissionMessage;
          setMessages((prev) => {
            // Only add if not already present
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            const updatedMessages = [...prev, newMessage];
            // Update cache
            messageCache.set(commission.id, updatedMessages);
            return updatedMessages;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "commission_messages",
          filter: `commission_id=eq.${commission.id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as CommissionMessage;
          setMessages((prev) => {
            const updatedMessages = prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            );
            // Update cache
            messageCache.set(commission.id, updatedMessages);
            return updatedMessages;
          });
        }
      )
      .subscribe();
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [commission.id, supabase]);

  // Batch fetch users with caching
  const fetchUsers = async (userIds: string[]) => {
    const missingUserIds = userIds.filter(
      (id) =>
        typeof id === "string" &&
        id.length > 0 &&
        !userCache.has(id) &&
        !userLoadingCache.has(id)
    );

    if (missingUserIds.length === 0) return;

    // Mark as loading to prevent duplicate requests
    missingUserIds.forEach((id) => userLoadingCache.add(id));

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, display_name, avatar_url")
        .in("id", missingUserIds);

      if (error) {
        console.error("Supabase user fetch error:", error);
      }

      if (data && data.length) {
        data.forEach((user) => {
          userCache.set(user.id, user);
        });
      }
    } finally {
      missingUserIds.forEach((id) => userLoadingCache.delete(id));
    }
  };

  // Pre-populate user cache with admin data when available
  useEffect(() => {
    if (allUsersForChat) {
      allUsersForChat.forEach(({ user }) => {
        userCache.set(user.id, {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
        });
      });
    }
  }, [allUsersForChat]);

  // Pre-populate user cache with commission owner data for regular users
  useEffect(() => {
    if (!isAdmin && commission.user_id && commission.display_name) {
      userCache.set(commission.user_id, {
        id: commission.user_id,
        display_name: commission.display_name,
        avatar_url: commission.avatar_url || null,
      });
    }
  }, [
    isAdmin,
    commission.user_id,
    commission.display_name,
    commission.avatar_url,
  ]);

  // Fetch users when messages change
  useEffect(() => {
    if (!messages.length) return;
    const uniqueUserIds = Array.from(new Set(messages.map((m) => m.user_id)));
    fetchUsers(uniqueUserIds);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError("You must be logged in to send messages");
        return;
      }

      await createCommissionMessage({
        commission_id: commission.id,
        user_id: currentUser.id,
        message_type: "text",
        content: newMessage.trim(),
        file_url: null,
      });

      // Don't add to local state - let the real-time subscription handle it
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic
      console.log("File upload:", file);
    }
  };

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pre-calculate which messages should show avatar/name (instant grouping)
  const getMessageGroupInfo = (messageIndex: number) => {
    if (messageIndex === 0)
      return { showAvatar: true, groupStartTime: messages[0].created_at };

    const currentMessage = messages[messageIndex];
    const prevMessage = messages[messageIndex - 1];

    // Different user = new group
    if (currentMessage.user_id !== prevMessage.user_id) {
      return { showAvatar: true, groupStartTime: currentMessage.created_at };
    }

    // Same user - check if more than 5 minutes from group start
    let groupStartIndex = messageIndex - 1;
    let groupStartTime = prevMessage.created_at;

    // Walk backwards to find the actual group start
    while (groupStartIndex > 0) {
      const potentialPrev = messages[groupStartIndex - 1];
      if (potentialPrev.user_id !== currentMessage.user_id) break;

      const potentialPrevTime = new Date(potentialPrev.created_at).getTime();
      const groupStartTimeMs = new Date(groupStartTime).getTime();

      // If more than 5 minutes from group start, this is a new group
      if (groupStartTimeMs - potentialPrevTime > 5 * 60 * 1000) break;

      groupStartTime = potentialPrev.created_at;
      groupStartIndex--;
    }

    // Check if current message is within 5 minutes of group start
    const groupStartTimeMs = new Date(groupStartTime).getTime();
    const currentTimeMs = new Date(currentMessage.created_at).getTime();
    const showAvatar = currentTimeMs - groupStartTimeMs > 5 * 60 * 1000;

    return {
      showAvatar,
      groupStartTime: showAvatar ? currentMessage.created_at : groupStartTime,
    };
  };

  // Info card close on outside click
  useEffect(() => {
    if (!infoCard) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (
        e.target.closest(".info-card-popover") ||
        e.target.closest(".info-card-trigger")
      ) {
        return;
      }
      setInfoCard(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [infoCard]);

  // Early return if commission is not available
  if (!commission) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-[var(--bg-primary)] items-center justify-center">
        <div className="text-center text-[var(--red-muted)]">
          <div className="text-lg font-semibold mb-2">Commission not found</div>
          <div className="text-sm">Please check the URL and try again.</div>
        </div>
      </div>
    );
  }

  const getUserInfoForMessage = (message: CommissionMessage) => {
    // Try to find user in allUsers (admin view) - this is immediate, no async needed
    let userObj = null;
    if (allUsers) {
      userObj = allUsers.find((u) => u.user.id === message.user_id);
    }
    // If not found, fallback to commission owner
    if (!userObj && commission.user_id === message.user_id) {
      userObj = {
        user: {
          id: commission.user_id,
          display_name: commission.display_name || "Unknown",
          avatar_url: null, // fallback if not available
        },
        commissions: userCommissions || [],
      };
    }
    return userObj;
  };

  const getCachedUser = (userId: string) => {
    return userCache.get(userId);
  };

  // Get display name with priority: cached data > admin data > "Unknown"
  const getDisplayName = (message: CommissionMessage) => {
    // First priority: cached user data (includes admin data)
    const cachedUser = getCachedUser(message.user_id);
    if (cachedUser && cachedUser.display_name) {
      return cachedUser.display_name;
    }

    // Second priority: admin data (fallback)
    const userObj = getUserInfoForMessage(message);
    if (userObj && userObj.user.display_name) {
      return userObj.user.display_name;
    }

    // Third priority: commission owner data
    if (message.user_id === commission.user_id && commission.display_name) {
      return commission.display_name;
    }

    // Last resort: "Unknown" (but this should be rare)
    return "Unknown";
  };

  // Get avatar_url with same priority as display name
  const getAvatarUrl = (message: CommissionMessage) => {
    const cachedUser = getCachedUser(message.user_id);
    if (cachedUser && cachedUser.avatar_url) {
      return cachedUser.avatar_url;
    }
    const userObj = getUserInfoForMessage(message);
    if (userObj && userObj.user.avatar_url) {
      return userObj.user.avatar_url;
    }
    // Check if it's the commission owner
    if (message.user_id === commission.user_id && commission.avatar_url) {
      return commission.avatar_url;
    }
    return null;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[var(--bg-primary)]">
      {/* Left Sidebar - Commission List */}
      {isAdmin ? (
        <div className="w-64 bg-[var(--bg-secondary)] flex flex-col pt-4 px-2 shadow-lg overflow-y-auto">
          <div className="mb-4 px-2 text-[var(--red-light)] font-bold text-lg">
            All Users
          </div>
          {allUsers?.map(({ user, commissions }) => (
            <div key={user.id} className="mb-2">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition group ${
                  expandedUserIds.includes(user.id)
                    ? "bg-[var(--bg-tertiary)]"
                    : ""
                }`}
                onClick={() => {
                  setExpandedUserIds((prev) => {
                    const newExpanded = prev.includes(user.id)
                      ? prev.filter((id) => id !== user.id)
                      : [...prev, user.id];
                    // Save to localStorage
                    localStorage.setItem(
                      "chat-expanded-users",
                      JSON.stringify(newExpanded)
                    );
                    return newExpanded;
                  });
                }}
              >
                <div className="w-10 h-10 bg-[var(--red-primary)] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.display_name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[var(--red-light)] font-semibold truncate group-hover:text-[var(--red-primary)]">
                    {user.display_name || "Unknown"}
                  </div>
                  <div className="text-[var(--red-muted)] text-xs truncate">
                    {commissions.length} commission
                    {commissions.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <span className="text-[var(--red-muted)] text-lg">
                  {expandedUserIds.includes(user.id) ? "▼" : "▶"}
                </span>
              </div>
              {expandedUserIds.includes(user.id) && (
                <div className="rounded-lg bg-[var(--bg-secondary)] transition mt-1">
                  <div className="py-1">
                    {commissions.map(
                      (comm: Commission & { display_name?: string }) => (
                        <button
                          key={comm.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (comm.id !== commission.id) {
                              router.push(`/commissions/${comm.id}`);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 rounded-md transition-colors text-[var(--red-light)] font-medium text-sm mb-1
                          ${
                            comm.id === commission.id
                              ? "bg-[var(--bg-tertiary)] text-white"
                              : "hover:bg-[var(--bg-tertiary)]"
                          }
                        `}
                        >
                          <div className="truncate">
                            {comm.category_name} - {comm.type_name}
                          </div>
                          <div className="text-xs opacity-75 capitalize">
                            {comm.status}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        userCommissions &&
        userCommissions.length > 0 && (
          <div className="w-64 bg-[var(--bg-secondary)] flex flex-col pt-4 px-2 shadow-lg">
            {/* User Card (clickable for profile info) */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-tertiary)] transition group mb-2"
              onClick={() => {
                // TODO: Open profile info card/modal
                alert("Profile info card coming soon!");
              }}
            >
              <div className="w-10 h-10 bg-[var(--red-primary)] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {commission.display_name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[var(--red-light)] font-semibold truncate group-hover:text-[var(--red-primary)]">
                  {commission.display_name || "Unknown"}
                </div>
                <div className="text-[var(--red-muted)] text-xs truncate">
                  {userCommissions.length} commission
                  {userCommissions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* My Commissions - always visible */}
            <div className="rounded-lg bg-[var(--bg-tertiary)] transition">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[var(--red-light)] font-semibold text-sm">
                  My Commissions
                </span>
              </div>
              <div className="py-1">
                {userCommissions.map(
                  (comm: Commission & { display_name?: string }) => (
                    <button
                      key={comm.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (comm.id !== commission.id) {
                          router.push(`/commissions/${comm.id}`);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors text-[var(--red-light)] font-medium text-sm mb-1
                      ${
                        comm.id === commission.id
                          ? "bg-[var(--bg-tertiary)] text-white"
                          : "hover:bg-[var(--bg-tertiary)]"
                      }
                    `}
                    >
                      <div className="truncate">
                        {comm.category_name} - {comm.type_name}
                      </div>
                      <div className="text-xs opacity-75 capitalize">
                        {comm.status}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHeader commission={commission} />
        <ChatMessages
          messages={messages}
          currentUserId={currentUserId}
          getDisplayName={getDisplayName}
          getAvatarUrl={getAvatarUrl}
          formatMessageTime={formatMessageTime}
          getMessageGroupInfo={getMessageGroupInfo}
          onAvatarClick={(msg, e) => {
            const userObj = getUserInfoForMessage(msg);
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setInfoCard({
              userId: userObj?.user.id || msg.user_id,
              anchorRect: rect,
              displayName: getDisplayName(msg),
              avatarUrl: getAvatarUrl(msg),
              commissionCount: userObj?.commissions?.length,
              isAdmin: false,
            });
          }}
          onSenderClick={(msg, e) => {
            const userObj = getUserInfoForMessage(msg);
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setInfoCard({
              userId: userObj?.user.id || msg.user_id,
              anchorRect: rect,
              displayName: getDisplayName(msg),
              avatarUrl: getAvatarUrl(msg),
              commissionCount: userObj?.commissions?.length,
              isAdmin: false,
            });
          }}
          messagesContainerRef={messagesContainerRef}
          loading={loading}
          error={error}
          loadingMore={loadingMore}
          showJumpToPresent={showJumpToPresent}
          onJumpToPresent={scrollToBottom}
        />
        <ChatInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onSend={handleSendMessage}
          onFileUpload={handleFileUpload}
          loading={sending}
          fileInputRef={fileInputRef}
          placeholder={`Message @${commission.display_name || "KakaoChan"}`}
        />
        {/* Info Card Popover */}
        {infoCard &&
          infoCard.anchorRect &&
          (() => {
            // Calculate popover position
            const cardWidth = 320;
            const cardHeight = 220;
            const padding = 12;
            const viewportHeight = window.innerHeight;
            let top =
              infoCard.anchorRect.top +
              window.scrollY -
              cardHeight / 2 +
              infoCard.anchorRect.height / 2;
            const left = infoCard.anchorRect.right + window.scrollX + 16;
            // Clamp top so card is always fully visible
            if (top + cardHeight + padding > viewportHeight) {
              top = viewportHeight - cardHeight - padding;
            }
            if (top < padding) top = padding;
            return (
              <div
                className="info-card-popover fixed z-30 bg-[var(--bg-secondary)] border border-[var(--red-tertiary)] rounded-xl shadow-2xl p-0 min-w-[320px] max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                style={{
                  top,
                  left,
                  width: cardWidth,
                  height: cardHeight,
                }}
              >
                {/* Avatar */}
                <div className="w-full flex flex-col items-center bg-[var(--bg-primary)] rounded-t-xl pt-6 pb-2">
                  <div className="w-20 h-20 bg-[var(--red-primary)] rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-[var(--bg-secondary)] shadow-lg">
                    {infoCard.displayName.charAt(0)}
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 w-full flex flex-col items-center px-6 pt-2 pb-4">
                  <div className="text-xl font-bold text-[var(--red-light)] mb-1 text-center">
                    {infoCard.displayName}
                  </div>
                  {infoCard.isAdmin && (
                    <div className="text-xs bg-[var(--red-primary)] text-white px-2 py-1 rounded-full mb-1">
                      Admin
                    </div>
                  )}
                  {typeof infoCard.commissionCount === "number" && (
                    <div className="text-xs text-[var(--red-muted)] mb-1">
                      {infoCard.commissionCount} commission
                      {infoCard.commissionCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-2 right-2 px-2 py-1 bg-[var(--red-primary)] text-white rounded hover:bg-[var(--red-secondary)] text-xs"
                  onClick={() => setInfoCard(null)}
                >
                  ×
                </button>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
