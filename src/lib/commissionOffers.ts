import type { CommissionOffer } from '@/lib/types/commission';

export const commissionOffers: CommissionOffer[] = [
  // HALF + RIG
  {
    category: { name: 'Vtuber Model' },
    type: { name: 'Halfbody Model', price: 275 },
    subtype: { name: 'With Rigging', price: 225 },
    base_price: 275 + 225,
    comm_specific_inputs: [
        { name: 'Species (If non-human)', type: 'input', value: '' },
      { name: 'Boob Size', type: 'input', value: '' },
      { name: 'Nail Length/Type', type: 'input', value: '' },
      { name: 'Special Teeth', type: 'input', value: '' },
    ],
    addons: [
      { name: 'Face Expressions', type: 'list', value: [], price: 25 },
      { name: 'Color Changes', type: 'list', value: [], price: 35 },
      { name: 'Toggles', type: 'list', value: [], price: 45 },
      { name: 'Extra Outfits', type: 'list', value: [], price: 70 },
      { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 30 },
      { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 30 },
    ],
  },

  // HALF NO RIG
  {
    category: { name: 'Vtuber Model' },
    type: { name: 'Halfbody Model', price: 275 },
    subtype: { name: 'Art Only', price: 0 },
    base_price: 275,
    comm_specific_inputs: [
        { name: 'Species (If non-human)', type: 'input', value: '' },
      { name: 'Boob Size', type: 'input', value: '' },
      { name: 'Nail Length/Type', type: 'input', value: '' },
      { name: 'Special Teeth', type: 'input', value: '' },
    ],
    addons: [
      { name: 'Face Expressions', type: 'list', value: [], price: 25 },
      { name: 'Color Changes', type: 'list', value: [], price: 35 },
      { name: 'Toggles', type: 'list', value: [], price: 45 },
      { name: 'Extra Outfits', type: 'list', value: [], price: 70 },
      { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 30 },
      { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 30 },
    ],
  },

  // FULL + RIG
  {
    category: { name: 'Vtuber Model' },
    type: { name: 'Fullbody Model', price: 550 },
    subtype: { name: 'With Rigging', price: 450 },
    base_price: 550 + 450,
    comm_specific_inputs: [
        { name: 'Species (If non-human)', type: 'input', value: '' },
      { name: 'Boob Size', type: 'input', value: '' },
      { name: 'Nail Length/Type', type: 'input', value: '' },
      { name: 'Special Teeth', type: 'input', value: '' },
    ],
    addons: [
      { name: 'Face Expressions', type: 'list', value: [], price: 30 },
      { name: 'Color Changes', type: 'list', value: [], price: 40 },
      { name: 'Toggles', type: 'list', value: [], price: 55 },
      { name: 'Extra Hairstyles', type: 'list', value: [], price: 75 },
      { name: 'Extra Outfits', type: 'list', value: [], price: 140 },
      { name: 'Chibi Toggle', type: 'boolean', value: false, price: 25 },
      { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 50 },
      { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 50 },
    ],
  },

  // FULL NO RIG
  {
    category: { name: 'Vtuber Model' },
    type: { name: 'Fullbody Model', price: 550 },
    subtype: { name: 'Art Only', price: 0 },
    base_price: 550,
    comm_specific_inputs: [
        { name: 'Species (If non-human)', type: 'input', value: '' },
      { name: 'Boob Size', type: 'input', value: '' },
      { name: 'Nail Length/Type', type: 'input', value: '' },
      { name: 'Special Teeth', type: 'input', value: '' },
    ],
    addons: [
      { name: 'Face Expressions', type: 'list', value: [], price: 30 },
      { name: 'Color Changes', type: 'list', value: [], price: 40 },
      { name: 'Toggles', type: 'list', value: [], price: 55 },
      { name: 'Extra Hairstyles', type: 'list', value: [], price: 75 },
      { name: 'Extra Outfits', type: 'list', value: [], price: 140 },
      { name: 'Chibi Toggle', type: 'boolean', value: false, price: 25 },
      { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 50 },
      { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 50 },
    ],
  },
  {
  category: { name: 'Vtuber Model' },
  type: { name: 'Chibi Model', price: 250 },
  subtype: { name: 'With Rigging', price: 150 },
  base_price: 250 + 150,
  comm_specific_inputs: [
    { name: 'Species (If non-human)', type: 'input', value: '' },
    { name: 'Boob Size', type: 'input', value: '' },
    { name: 'Nail Length/Type', type: 'input', value: '' },
    { name: 'Special Teeth', type: 'input', value: '' },
  ],
  addons: [
    { name: 'Face Expressions', type: 'list', value: [], price: 25 },
    { name: 'Color Changes', type: 'list', value: [], price: 35 },
    { name: 'Toggles', type: 'list', value: [], price: 40 },
    { name: 'Extra Hairstyles', type: 'list', value: [], price: 40 },
    { name: 'Extra Outfits', type: 'list', value: [], price: 90 },
    { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 30 },
    { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 30 },
  ]
},
{
  category: { name: 'Vtuber Model' },
  type: { name: 'Chibi Model', price: 250 },
  subtype: { name: 'Art Only', price: 0 },
  base_price: 250,
  comm_specific_inputs: [
    { name: 'Species (If non-human)', type: 'input', value: '' },
    { name: 'Boob Size', type: 'input', value: '' },
    { name: 'Nail Length/Type', type: 'input', value: '' },
    { name: 'Special Teeth', type: 'input', value: '' },
  ],
  addons: [
    { name: 'Face Expressions', type: 'list', value: [], price: 25 },
    { name: 'Color Changes', type: 'list', value: [], price: 35 },
    { name: 'Toggles', type: 'list', value: [], price: 40 },
    { name: 'Extra Hairstyles', type: 'list', value: [], price: 40 },
    { name: 'Extra Outfits', type: 'list', value: [], price: 90 },
    { name: 'Sleep / Idle Animation', type: 'boolean', value: false, price: 30 },
    { name: 'VBridger Mouth Rigging', type: 'boolean', value: false, price: 30 },
  ]
},
// CHIBI
{
  category: { name: 'Illustration' },
  type: { name: 'Chibi', price: 60 },
  base_price: 60,
  character_count: {
    max: 3,
    price_per_extra: 30,
  },
},

// ANIMALS
{
  category: { name: 'Illustration' },
  type: { name: 'Animals', price: 70 },
  base_price: 70,
  character_count: {
    max: 3,
    price_per_extra: 35,
  },
},

// CHARACTER ILLUSTRATION - HEAD
{
  category: { name: 'Illustration' },
  type: { name: 'Character Illustration' },
  subtype: { name: 'Head', price: 80 },
  base_price: 80,
  // no extra characters allowed
},

// CHARACTER ILLUSTRATION - BUST UP
{
  category: { name: 'Illustration' },
  type: { name: 'Character Illustration' },
  subtype: { name: 'Bust Up', price: 90 },
  base_price: 90,
  character_count: {
    max: 2,
    price_per_extra: 45, 
  },
},

// CHARACTER ILLUSTRATION - HALFBODY
{
  category: { name: 'Illustration' },
  type: { name: 'Character Illustration' },
  subtype: { name: 'Halfbody', price: 100 },
  base_price: 100,
  character_count: {
    max: 2,
    price_per_extra: 50,
  },
},

// FULL ILLUSTRATION
{
  category: { name: 'Illustration' },
  type: { name: 'Full Illustration', price: 200 },
  base_price: 200,
  addons: [
    {
      name: 'Separated for Animation Use',
      type: 'boolean',
      value: false,
      price: 100,
    },
  ],
},

// PENCIL STYLE - BUST UP
{
  category: { name: 'Illustration' },
  type: { name: 'Pencil Style' },
  subtype: { name: 'Bust Up', price: 70 },
  base_price: 70,
  character_count: {
    max: 2,
    price_per_extra: 35, 
  },
},

// PENCIL STYLE - SURPRISE ME
{
  category: { name: 'Illustration' },
  type: { name: 'Pencil Style' },
  subtype: { name: 'Surprise Me', price: 50 },
  base_price: 50,
  character_count: {
    max: 2,
    price_per_extra: 25,
  },
},
// SUB BADGES - VERSION 1
{
  category: { name: 'Assets' },
  type: { name: 'Sub Badges' },
  subtype: { name: 'Version 1', price: 10 },
  base_price: 10,
  addons: [
    {
      name: 'Additional Badges (Same Motif, Different Colors)',
      type: 'list',
      value: [],
      price: 3, // per extra badge
    },
  ],
},

// SUB BADGES - VERSION 2
{
  category: { name: 'Assets' },
  type: { name: 'Sub Badges' },
  subtype: { name: 'Version 2', price: 10 },
  base_price: 10,
  addons: [
    {
      name: 'Extra Badges (Different Motifs)',
      type: 'list',
      value: [],
      price: 10, 
    },
  ],
},

// EMOTES
{
  category: { name: 'Assets' },
  type: { name: 'Emotes', price: 25 },
  base_price: 25,
  addons: [
    {
      name: 'Extra Emotes',
      type: 'list',
      value: [],
      price: 25,
    }
  ],
},

// PANELS
{
  category: { name: 'Assets' },
  type: { name: 'Panels', price: 45 },
  base_price: 45,
  addons: [
    {
      name: 'Extra Panels',
      type: 'list',
      value: [],
      price: 45,
    },
    {
      name: 'Bulk Discount (5+)',
      type: 'input',
      value: '',
      price: 0,
    },
  ],
},

// STREAM SCHEDULE
{
  category: { name: 'Assets' },
  type: { name: 'Stream Schedule', price: 30 },
  base_price: 30,
  comm_specific_inputs: [
    {
      name: 'File Type Needed (CSP/PSD)',
      type: 'input',
      value: '',
    },
    {
      name: 'Custom Canvas Size (Default 1920x1080)',
      type: 'input',
      value: '',
    },
  ],
},
// VAMPWOO
{
  category: { name: 'Vampwoo' },
  type: { name: 'Vampwoo Design', price: 50 },
  base_price: 50,
  description: 'A custom spooky/horny design. Price may vary based on complexity.',
}
];

