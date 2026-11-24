import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  FoodItem,
  ACTIVITY_LEVELS,
  VALID_GOALS,
  calculateBMI,
  classifyBMI,
  calculateBMR,
  calculateTDEE,
  calculateNutrition,
  filterByGoal,
  calculateSimilarityAndRank,
  planMeals,
} from './src/lib/dietEngine.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load Food Dataset
let foodDataset: FoodItem[] = [];

function loadDataset() {
  const datasetPath = path.resolve(process.cwd(), 'datasets/processed/processed_food_dataset.csv');
  try {
    if (!fs.existsSync(datasetPath)) {
      console.warn(`Dataset file not found at ${datasetPath}`);
      return;
    }

    const fileContent = fs.readFileSync(datasetPath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map((h) => h.trim());

    foodDataset = lines.slice(1).map((line) => {
      // Basic CSV parser for numeric values and food names
      const values: string[] = [];
      let inQuotes = false;
      let current = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        const rawVal = values[index];
        if (header === 'food') {
          row[header] = rawVal ? rawVal.replace(/^"|"$/g, '') : '';
        } else {
          row[header] = rawVal !== undefined && rawVal !== '' ? Number(rawVal) : 0;
        }
      });

      return row as FoodItem;
    });

    console.log(`✓ Loaded ${foodDataset.length} food records into memory.`);
  } catch (error) {
    console.error('Failed to load dataset:', error);
  }
}

loadDataset();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    dataset_loaded: foodDataset.length > 0,
    records_count: foodDataset.length,
  });
});

app.get('/api/goals', (req, res) => {
  res.json({ goals: VALID_GOALS });
});

app.get('/api/activity-levels', (req, res) => {
  res.json({ levels: ACTIVITY_LEVELS });
});

// API Routes
app.post('/api/bmi', (req, res) => {
  try {
    const { weight_kg, height_cm } = req.body;
    const bmi = calculateBMI(Number(weight_kg), Number(height_cm));
    res.json({ bmi, category: classifyBMI(bmi) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/bmr', (req, res) => {
  try {
    const { age, gender, weight_kg, height_cm } = req.body;
    const bmr = calculateBMR(Number(age), gender, Number(weight_kg), Number(height_cm));
    res.json({ bmr });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tdee', (req, res) => {
  try {
    const { bmr, activity_level } = req.body;
    const tdee = calculateTDEE(Number(bmr), activity_level);
    res.json({ tdee });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/nutrition', (req, res) => {
  try {
    const { tdee } = req.body;
    const nutrition = calculateNutrition(Number(tdee));
    res.json(nutrition);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/recommend/advanced', (req, res) => {
  try {
    const { target_calories, target_protein, target_fat, target_carbohydrates, goal, top_n = 10 } = req.body;

    const filtered = filterByGoal(foodDataset, goal);
    const ranked = calculateSimilarityAndRank(
      filtered,
      Number(target_calories),
      Number(target_protein),
      Number(target_fat),
      Number(target_carbohydrates)
    );

    res.json({
      count: Math.min(top_n, ranked.length),
      goal: goal || 'all',
      results: ranked.slice(0, top_n),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/meal-plan', (req, res) => {
  try {
    const { age, gender, weight_kg, height_cm, activity_level, goal } = req.body;

    const bmr = calculateBMR(Number(age), gender, Number(weight_kg), Number(height_cm));
    const tdee = calculateTDEE(bmr, activity_level);
    const nutrition = calculateNutrition(tdee);

    const filtered = filterByGoal(foodDataset, goal);
    const ranked = calculateSimilarityAndRank(
      filtered,
      nutrition.Calories,
      nutrition['Protein (g)'],
      nutrition['Fat (g)'],
      nutrition['Carbohydrates (g)']
    );

    const mealPlan = planMeals(ranked, nutrition.Calories);

    res.json({
      bmr,
      tdee,
      nutrition,
      goal,
      meal_plan: mealPlan,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Full Profile convenience route
app.post('/api/profile', (req, res) => {
  try {
    const { age, gender, weight_kg, height_cm, activity_level, goal, top_n = 10 } = req.body;

    const bmiVal = calculateBMI(Number(weight_kg), Number(height_cm));
    const bmrVal = calculateBMR(Number(age), gender, Number(weight_kg), Number(height_cm));
    const tdeeVal = calculateTDEE(bmrVal, activity_level);
    const nutritionVal = calculateNutrition(tdeeVal);

    const filtered = filterByGoal(foodDataset, goal);
    const ranked = calculateSimilarityAndRank(
      filtered,
      nutritionVal.Calories,
      nutritionVal['Protein (g)'],
      nutritionVal['Fat (g)'],
      nutritionVal['Carbohydrates (g)']
    );

    res.json({
      bmi: { value: bmiVal, category: classifyBMI(bmiVal) },
      bmr: bmrVal,
      tdee: tdeeVal,
      nutrition: nutritionVal,
      goal,
      recommendations: {
        count: Math.min(top_n, ranked.length),
        results: ranked.slice(0, top_n),
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
