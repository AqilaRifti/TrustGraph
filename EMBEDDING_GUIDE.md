# Embedding System Guide

## 🎯 What Are Embeddings?

Embeddings convert text into numerical vectors (arrays of numbers) that capture semantic meaning. Similar content gets similar vectors.

**Example:**
```
"Artificial Intelligence" → [0.23, -0.45, 0.67, ..., 0.12]  (384 numbers)
"Machine Learning"        → [0.25, -0.43, 0.69, ..., 0.15]  (384 numbers)
"Pizza Recipe"            → [-0.89, 0.12, -0.34, ..., 0.78] (384 numbers)
```

The first two are similar (close vectors), the third is different (distant vector).

## 🔧 How It Works in This Project

### Step 1: Generate Embeddings (Local, No API Needed!)

```python
from backend.embeddings import EmbeddingManager

# Initialize (downloads model first time only, ~90MB)
manager = EmbeddingManager()

# Convert text to vector
text = "Artificial Intelligence is transforming technology"
vector = manager.generate_embedding(text)

print(f"Vector shape: {vector.shape}")  # (384,)
print(f"First 5 numbers: {vector[:5]}")
```

**Model Used:** `all-MiniLM-L6-v2`
- **Size:** 384 dimensions
- **Speed:** Very fast (local, no API calls)
- **Quality:** Good for semantic similarity

### Step 2: Store in Pinecone (Optional)

```python
# Store Wikipedia embedding
manager.store_embedding(
    topic="Artificial Intelligence",
    source="wikipedia",
    vector=wiki_vector,
    metadata={'content_length': 5000}
)

# Store Grokipedia embedding
manager.store_embedding(
    topic="Artificial Intelligence",
    source="grokipedia",
    vector=grok_vector,
    metadata={'content_length': 4800}
)
```

**Pinecone Benefits:**
- Persistent storage (survives restarts)
- Fast similarity search
- Metadata filtering
- Free tier: 100K vectors

### Step 3: Compare Embeddings

```python
from sklearn.metrics.pairwise import cosine_similarity

# Calculate similarity (0 = different, 1 = identical)
similarity = cosine_similarity(
    wiki_vector.reshape(1, -1),
    grok_vector.reshape(1, -1)
)[0][0]

print(f"Similarity: {similarity:.2f}")

# Interpret results
if similarity >= 0.8:
    print("✓ High similarity - content matches well")
elif similarity >= 0.6:
    print("⚠ Moderate similarity - some differences")
else:
    print("✗ Low similarity - significant differences")
```

## 🧪 Test the Embedding System

### Option 1: Simple Test (No Pinecone Required)

Create `test_embeddings.py`:

```python
from backend.embeddings import EmbeddingManager
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Initialize
manager = EmbeddingManager()

# Test texts
text1 = "Artificial Intelligence is a branch of computer science"
text2 = "AI is a field of computer science"
text3 = "Pizza is a delicious Italian food"

# Generate embeddings
vec1 = manager.generate_embedding(text1)
vec2 = manager.generate_embedding(text2)
vec3 = manager.generate_embedding(text3)

# Compare
sim_1_2 = cosine_similarity(vec1.reshape(1, -1), vec2.reshape(1, -1))[0][0]
sim_1_3 = cosine_similarity(vec1.reshape(1, -1), vec3.reshape(1, -1))[0][0]

print(f"Similarity (AI vs AI): {sim_1_2:.3f}")  # Should be high (~0.8+)
print(f"Similarity (AI vs Pizza): {sim_1_3:.3f}")  # Should be low (~0.2)
```

Run:
```bash
python test_embeddings.py
```

### Option 2: Full Test with Pinecone

1. **Get Pinecone API Key** (Free)
   - Go to: https://www.pinecone.io/
   - Sign up for free account
   - Copy API key from dashboard

2. **Add to .env**
   ```
   PINECONE_API_KEY=your_actual_key_here
   ```

3. **Run Full Test**
   ```bash
   python test_full_embedding.py
   ```

## 📊 How It's Used in the App

### In `app.py` (Scan Process)

```python
# 1. Fetch content
wiki = scraper.fetch_wikipedia("Artificial Intelligence")
grok = scraper.fetch_grokipedia("Artificial Intelligence")

# 2. Compare (embeddings generated inside)
comparison = comparator.compare_topics(
    "Artificial Intelligence",
    wiki['content'],
    grok['content']
)

# 3. Get results
print(f"Similarity: {comparison['similarity_score']}")
print(f"Discrepancies: {len(comparison['discrepancies'])}")
```

### In `backend/comparison.py`

```python
def compare_topics(self, topic, wiki_content, grok_content):
    # Generate embeddings
    wiki_embedding = self.embedding_manager.generate_embedding(wiki_content)
    grok_embedding = self.embedding_manager.generate_embedding(grok_content)
    
    # Store in Pinecone
    self.embedding_manager.store_embedding(topic, 'wikipedia', wiki_embedding)
    self.embedding_manager.store_embedding(topic, 'grokipedia', grok_embedding)
    
    # Calculate similarity
    similarity = cosine_similarity(wiki_embedding, grok_embedding)
    
    return {
        'similarity_score': similarity,
        'discrepancies': [...]
    }
```

## 🔍 Understanding the Math

### Cosine Similarity Formula

```
similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product (sum of element-wise multiplication)
- ||A|| = magnitude of vector A
- ||B|| = magnitude of vector B
```

**Example:**
```python
A = [1, 2, 3]
B = [2, 3, 4]

# Dot product
dot = 1*2 + 2*3 + 3*4 = 20

# Magnitudes
mag_A = sqrt(1² + 2² + 3²) = 3.74
mag_B = sqrt(2² + 3² + 4²) = 5.39

# Similarity
similarity = 20 / (3.74 × 5.39) = 0.99  # Very similar!
```

## 🚀 Quick Start Commands

### Install Dependencies
```bash
pip install sentence-transformers scikit-learn numpy
pip install pinecone-client  # Optional, for storage
```

### Test Without Pinecone
```bash
# Set empty key to skip Pinecone
export PINECONE_API_KEY=""

# Run test
python -c "
from backend.embeddings import EmbeddingManager
m = EmbeddingManager()
v = m.generate_embedding('Hello World')
print(f'✓ Generated {len(v)}-dimensional vector')
"
```

### Test With Pinecone
```bash
# Set your key
export PINECONE_API_KEY="your_key_here"

# Run full app
python app.py
```

## 💡 Tips & Tricks

### 1. Model Downloads Automatically
First run downloads the model (~90MB). Subsequent runs are instant.

### 2. Pinecone is Optional
The system works without Pinecone - embeddings are generated on-the-fly.

### 3. Batch Processing
For multiple texts:
```python
texts = ["Text 1", "Text 2", "Text 3"]
vectors = manager.model.encode(texts)  # Returns array of vectors
```

### 4. Similarity Thresholds
- **0.9-1.0**: Nearly identical
- **0.8-0.9**: Very similar
- **0.7-0.8**: Similar
- **0.6-0.7**: Somewhat similar
- **<0.6**: Different

### 5. Memory Usage
- Each vector: 384 floats × 4 bytes = 1.5 KB
- 1000 vectors: ~1.5 MB
- Very efficient!

## 🐛 Troubleshooting

### "No module named 'sentence_transformers'"
```bash
pip install sentence-transformers
```

### "Pinecone connection failed"
- Check API key in `.env`
- Verify internet connection
- System works without Pinecone (just slower)

### "Model download slow"
- First download takes time (~90MB)
- Cached after first run
- Use `model_cache_folder` to specify location

### "Out of memory"
- Reduce batch size
- Process one text at a time
- Use smaller model (not recommended)

## 📚 Learn More

- **Sentence-Transformers**: https://www.sbert.net/
- **Pinecone Docs**: https://docs.pinecone.io/
- **Cosine Similarity**: https://en.wikipedia.org/wiki/Cosine_similarity
- **Vector Embeddings**: https://www.pinecone.io/learn/vector-embeddings/

---

**Ready to test?** Run `python test_embeddings.py` to see it in action!
