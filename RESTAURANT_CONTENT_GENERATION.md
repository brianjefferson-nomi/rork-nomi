# 🍽️ Restaurant Content Generation with OpenAI

This script uses OpenAI's GPT-4 to automatically generate compelling descriptions and vibe tags for restaurants in your database.

## ✨ Features

- **AI-Generated Descriptions**: Creates unique, compelling restaurant descriptions (50-200 characters)
- **Smart Vibe Tags**: Generates 3-5 relevant vibe tags per restaurant
- **Rate Limiting**: Includes delays to respect OpenAI API limits
- **Database Integration**: Directly updates your Supabase database
- **Error Handling**: Robust error handling and logging
- **Batch Processing**: Processes multiple restaurants efficiently

## 🚀 Quick Start

### 1. Set Up Environment Variables

Add your OpenAI API key to your `.env` file:

```bash
# Copy from n8n.env to .env
cp n8n.env .env

# Edit .env and add your actual OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 2. Run the Script

```bash
# Option 1: Using npm script
npm run generate-content

# Option 2: Direct execution
node generate-restaurant-content.js
```

## 📊 What It Does

1. **Fetches Restaurants**: Finds restaurants missing descriptions or vibe tags
2. **Generates Content**: Uses OpenAI to create unique descriptions and vibe tags
3. **Enriches Data**: Adds neighborhood and cuisine-based vibes
4. **Updates Database**: Saves all generated content to your Supabase database
5. **Provides Summary**: Shows detailed results and statistics

## 🎯 Sample Output

### Description Example:
- **Input**: Restaurant with basic info
- **Output**: "Authentic Italian trattoria serving handmade pasta in a cozy Manhattan setting with traditional family recipes"

### Vibe Tags Example:
- **Input**: Restaurant data
- **Output**: "Popular, Local, Casual, Authentic, Cozy, Manhattan, Italian, Family-Friendly"

## ⚙️ Configuration

### Rate Limiting
- **Delay**: 3 seconds between API calls
- **Batch Size**: Processes 10 restaurants at a time
- **Model**: Uses GPT-4o-mini for cost efficiency

### Content Rules
- **Descriptions**: 50-200 characters, specific and authentic
- **Vibes**: 3-5 tags, avoiding generic terms
- **Enrichment**: Adds neighborhood and cuisine tags automatically

## 🔧 Customization

### Modify Prompts
Edit the system prompts in the script to change:
- Description style and length
- Vibe tag categories
- Content tone and focus

### Adjust Processing
- Change batch size in the `limit(10)` parameter
- Modify rate limiting delays
- Add custom enrichment logic

## 📈 Monitoring

The script provides detailed logging:
- Processing progress for each restaurant
- AI-generated content preview
- Database update confirmations
- Final summary with statistics

## 🚨 Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `OPENAI_API_KEY` is set in `.env`
2. **Supabase Connection**: Check your Supabase credentials
3. **Rate Limits**: The script includes automatic delays
4. **API Errors**: Check OpenAI account status and credits

### Error Handling

- Individual restaurant failures don't stop the process
- Detailed error logging for debugging
- Graceful fallbacks for missing data

## 💡 Best Practices

1. **Test First**: Run with a small batch to verify setup
2. **Monitor Costs**: OpenAI API calls have associated costs
3. **Review Content**: Check generated content quality
4. **Regular Updates**: Run periodically to keep content fresh

## 🔄 Automation

### Scheduled Execution
```bash
# Add to crontab for weekly execution
0 2 * * 0 cd /path/to/your/project && npm run generate-content
```

### Integration
- Import the script as a module in other Node.js applications
- Use the `enrichRestaurant` function for individual processing
- Integrate with your existing restaurant management workflows

---

**Ready to enhance your restaurant database with AI-generated content? Run `npm run generate-content` to get started!** 🚀
