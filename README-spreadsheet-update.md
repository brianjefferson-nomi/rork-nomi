# Restaurant Spreadsheet Update Tool

This tool automatically updates your restaurant spreadsheet with all the requested transformations.

## 🚀 Quick Start

1. **Place your spreadsheet** in the project directory (e.g., `restaurants.xlsx`)

2. **Run the update script:**
```bash
node update-restaurant-spreadsheet.js restaurants.xlsx restaurants-updated.xlsx
```

3. **Check the output file** `restaurants-updated.xlsx`

## 📋 What the Script Does

### ✅ **Column A: Clean Business Names**
- Removes: Corp, Inc, LLC, Ltd, Co, Company, etc.
- Example: "Joe's Pizza Corp Inc" → "Joe's Pizza"

### ✅ **Columns C-E: Merge Address**
- Combines street, city, state into one full address
- Example: "123 Main St" + "New York" + "NY" → "123 Main St, New York, NY"

### ✅ **Column G: Add Neighborhoods**
- Automatically detects NYC neighborhoods from addresses
- Supports: Manhattan, Brooklyn, Queens, Bronx, SoHo, Chelsea, etc.

### ✅ **Column H: Fill Cuisine Types**
- Guesses cuisine from restaurant names
- Supports: Italian, Japanese, Chinese, Mexican, American, Thai, etc.

### ✅ **Column I: Add Price Ranges**
- $ = Budget, $$ = Mid-range, $$$ = Expensive, $$$$ = Luxury
- Based on restaurant name and location

### ✅ **Column J: Add Ratings**
- Attempts to get real ratings from Google Places API
- Defaults to 4.0 if not found

### ✅ **Column K: Add Websites**
- Attempts to find restaurant websites
- Uses Google Places API when available

### ✅ **Column L: Add Descriptions**
- Creates descriptions based on restaurant info
- Format: "[Name] offers delicious [Cuisine] cuisine in [Neighborhood]."

### ✅ **Column M: Add Hours**
- Default format: "Mon-Sun: 11:00 AM - 10:00 PM"
- Can be customized

### ✅ **Column N: Add Menu Highlights**
- Provides 2-3 signature dishes based on cuisine type
- Examples: "Margherita Pizza, Spaghetti Carbonara, Tiramisu"

### ✅ **Columns O-P: Remove Zero Rows**
- Automatically skips any row where Column O or P equals 0

## 📊 Expected Output Format

| Name | Address | Neighborhood | Cuisine | Price Range | Rating | Website | Description | Hours | Menu Highlights |
|------|---------|--------------|---------|-------------|--------|---------|-------------|-------|-----------------|
| Joe's Pizza | 123 Main St, New York, NY | Manhattan | Italian | $$ | 4.2 | https://joespizza.com | Joe's Pizza offers delicious Italian cuisine in Manhattan. | Mon-Sun: 11:00 AM - 10:00 PM | Margherita Pizza, Spaghetti Carbonara, Tiramisu |

## 🔧 Customization

### **Add Google Places API (Optional)**
For better ratings and website data:

1. Get a Google Places API key
2. Add to `.env` file:
```
GOOGLE_API_KEY=your_api_key_here
```

### **Customize Neighborhood Detection**
Edit the `guessNeighborhood()` function in the script to add more neighborhoods.

### **Customize Cuisine Detection**
Edit the `guessCuisine()` function to add more cuisine types.

## 📝 Usage Examples

```bash
# Basic usage
node update-restaurant-spreadsheet.js input.xlsx output.xlsx

# With custom file names
node update-restaurant-spreadsheet.js my-restaurants.xlsx updated-restaurants.xlsx

# Process CSV files (will be converted to Excel)
node update-restaurant-spreadsheet.js restaurants.csv restaurants-updated.xlsx
```

## ⚠️ Important Notes

- **Backup your original file** before running the script
- **API calls are rate-limited** to avoid hitting limits
- **The script creates a new file** - your original is preserved
- **Column names are flexible** - the script tries multiple variations

## 🐛 Troubleshooting

### **"Input file not found"**
- Make sure your spreadsheet is in the same directory as the script
- Check the file name spelling

### **"Error reading spreadsheet"**
- Make sure the file is a valid Excel (.xlsx) or CSV file
- Check that the file isn't corrupted

### **"No restaurants processed"**
- Check that your spreadsheet has data in the expected columns
- Make sure Column O and P don't contain 0 values

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your spreadsheet format matches the expected structure
3. Make sure all required dependencies are installed

## 🎯 Next Steps

After running the script:
1. Review the updated spreadsheet
2. Manually adjust any incorrect data
3. Import the cleaned data into your database
4. Use the data in your restaurant app!
