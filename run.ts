import fs from 'fs';
import XLSX from 'xlsx';

// Simple translation mapping (Swedish to English)
const translations: Record<string, string> = {
  'Vatten': 'Water',
  'SOJAprotein': 'Soy protein',
  'rapsolja': 'Rapeseed oil',
  'lök': 'Onion',
  'salt': 'Salt',
  'kryddor': 'Spices',
  'naturlig arom': 'Natural flavouring',
  'vitlök': 'Garlic',
  'potatismjöl': 'Potato flour',
  'kikärtor': 'Chickpeas',
  'persilja': 'Parsley',
  'koriander': 'Coriander',
  'spiskummin': 'Cumin',
  'kanel': 'Cinnamon',
  'paprika': 'Paprika',
  'socker': 'Sugar',
  'tomat': 'Tomato',
  'morot': 'Carrot',
  'mjölk': 'Milk',
  'ägg': 'Egg',
  'gluten': 'Gluten',
  'selleri': 'Celery',
  'senap': 'Mustard',
  'sesamfrön': 'Sesame seeds',
  'Köttfria': 'Meat-free',
  'Anammas': 'Anamma',
  'Quorn': 'Quorn',
  'Quorns': 'Quorn\'s',
  'Prova': 'Try',
  'Naturella': 'Natural',
  'MAX': 'MAX',
  'En': 'One',
  'Variera': 'Vary',
  'Njut': 'Enjoy',
  'Oumph!': 'Oumph!',
  'Felix': 'Felix',
  'Nuggets': 'Nuggets',
  'Pulled': 'Pulled',
  'Smakrika': 'Flavourful',
  'Vegansk': 'Vegan',
  'Green': 'Green',
  'Dumplings': 'Dumplings',
  'Äntligen': 'Finally',
  'Mungburgare': 'Mung bean burger',
  'Creamy': 'Creamy',
  'Grandiosas': 'Grandiosas',
  'Formbar': 'Mouldable',
  'Himmelskt': 'Heavenly',
  'VETE- och SOJAPROTEIN(vatten': 'WHEAT- and SOY PROTEIN(water',
  'kalciumklorid': 'Calcium chloride',
  'Vatten/vann': 'Water',
  'VETEMJÖL/HVETEMEL/HVEDEMEL': 'WHEAT FLOUR',
  'Kikärtor (84 %)': 'Chickpeas (84 %)',
  'Couscous (72 %) (VETE)': 'Couscous (72 %) (WHEAT)',
  'Risflingor': 'Rice flakes',
  'Icke-EU.': 'Non-EU.',
  'Spenat 41 %': 'Spinach 41 %',
  'Vitkål': 'White cabbage',
  'Morot (47%)': 'Carrot (47%)',
  'dinatriumdifosfat': 'Disodium diphosphate',
  'Mungböna* 68%': 'Mung bean* 68%',
  'vegansk ragùsås 40% (vatten': 'vegan ragù sauce 40% (water',
  'Gröna och röda linser (15 %)': 'Green and red lentils (15 %)',
  'Svenskodlad vegofärs 52% (SÖTLUPIN*': 'Swedish-grown veggie mince 52% (SWEET LUPIN*',
  'Rehydrerat ärtprotein (50%)': 'Rehydrated pea protein (50%)',
  'Kokta baljväxter 93% (SÖTLUPIN*': 'Cooked legumes 93% (SWEET LUPIN*',
};

// Function to sanitise and translate ingredients
const sanitiseIngredients = (ingredients: string | undefined): string => {
  if (!ingredients) return '';
  // Remove "INGREDIENSER:" or similar prefixes
  const cleaned = ingredients.replace(/^[^:]+:\s*/, '');
  // Get the first ingredient and translate
  const firstIngredient = cleaned.split(',')[0]?.trim();
  return translateText(firstIngredient);
};

// Function to translate text
const translateText = (text: string): string => {
  return text
    .split(' ')
    .map((word) => translations[word] || word)
    .join(' ');
};

// Function to determine product type
const getProductType = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('burger')) return 'Burger';
  if (lowerDesc.includes('nuggets')) return 'Nuggets';
  if (lowerDesc.includes('sausage') || lowerDesc.includes('korv')) return 'Sausages';
  if (lowerDesc.includes('meatball') || lowerDesc.includes('köttbullar')) return 'Meatballs';
  if (lowerDesc.includes('cutlet') || lowerDesc.includes('kotlett')) return 'Cutlets';
  if (lowerDesc.includes('seitan')) return 'Seitan';
  if (lowerDesc.includes('bites') || lowerDesc.includes('bitar')) return 'Bites (chicken-like)';
  return 'Other';
};

// Function to get main ingredient
const getMainIngredient = (ingredients: string | undefined): string => {
  if (!ingredients) return '';

  // Remove "INGREDIENSER:" or similar prefixes
  const cleaned = ingredients.replace(/^[^:]+:\s*/, '');

  // Split ingredients and filter out water and other non-ingredients
  const ingredientList = cleaned.split(',')
    .map(ing => ing.trim())
    .filter(ing => !/vatten|water|salt|kryddor|naturlig arom/i.test(ing));

  // Get the first real ingredient and translate
  return translateText(ingredientList[0] || '');
};

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('food.json', 'utf-8'));

// Debug: Log the structure of jsonData
console.log(jsonData);

// Extract the items from the JSON
const items = jsonData.results.items || jsonData.results; // Fallback to jsonData.results if items is not found

// Ensure items is an array
if (!Array.isArray(items)) {
  throw new Error('Expected items to be an array. Check the structure of food.json.');
}

// Map the data to the desired CSV format
const mappedData = items.map((item: any) => {
  // Get the main category from navCategories
  const mainCategory = item.navCategories?.[0]?.superCategories?.[0]?.name || 'vegetariskt';
  // Get the sub category from navCategories
  const subCategory = item.navCategories?.[0]?.name || 'ovrig-vegetariskt';
  // Create URL-friendly product name
  const productName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    'Product Name': item.name,
    'Type of Product': getProductType(item.description || ''),
    'Main Ingredient': getMainIngredient(item.listOfIngredients),
    Brand: translateText(item.manufacturerName),
    'Sale Location': 'Sweden',
    'On-line Reference': `https://www.coop.se/handla/varor/${mainCategory.toLowerCase()}/${subCategory.toLowerCase()}/${productName}-${item.ean}`,
    'Date Visited': new Date().toISOString(),
  };
});

// Convert to worksheet
const worksheet = XLSX.utils.json_to_sheet(mappedData);

// Create a new workbook and add the worksheet
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Food Items');

// Write the workbook to an Excel file
XLSX.writeFile(workbook, 'food_items.xlsx');

console.log('Excel file generated successfully!');