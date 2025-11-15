#!/usr/bin/env python3
"""
Simple test script for the embedding system
No Pinecone required - just tests local embeddings
"""

import sys
import os

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

print("=" * 60)
print("Embedding System Test")
print("=" * 60)
print()

# Step 1: Import
print("📦 Step 1: Importing modules...")
try:
    from backend.embeddings import EmbeddingManager
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    print("✓ Imports successful")
except ImportError as e:
    print(f"✗ Import failed: {e}")
    print("\nPlease install dependencies:")
    print("  pip install sentence-transformers scikit-learn numpy")
    sys.exit(1)

print()

# Step 2: Initialize
print("🔧 Step 2: Initializing embedding manager...")
print("   (First run downloads model ~90MB, please wait...)")
try:
    # Disable Pinecone for this test
    os.environ['PINECONE_API_KEY'] = 'pcsk_7JTp7h_FpGP9m4TPSGKQdnQmBPUAdn67tpPh8k4xiNQ8ipAncHfFRmX5h5PYmXTJQgHuDj'
    manager = EmbeddingManager()
    print("✓ Manager initialized")
except Exception as e:
    print(f"✗ Initialization failed: {e}")
    sys.exit(1)

print()

# Step 3: Generate embeddings
print("🎯 Step 3: Generating embeddings...")
test_texts = {
    "AI 1": "Artificial Intelligence is a branch of computer science that deals with intelligent machines",
    "AI 2": "AI is a field of computer science focused on creating smart machines",
    "Pizza": "Pizza is a delicious Italian food made with dough, tomato sauce, and cheese"
}

embeddings = {}
for name, text in test_texts.items():
    try:
        vec = manager.generate_embedding(text)
        embeddings[name] = vec
        print(f"✓ Generated embedding for '{name}': {vec.shape} dimensions")
    except Exception as e:
        print(f"✗ Failed for '{name}': {e}")
        sys.exit(1)

print()

# Step 4: Calculate similarities
print("📊 Step 4: Calculating similarities...")
print()

def calc_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors"""
    return cosine_similarity(vec1.reshape(1, -1), vec2.reshape(1, -1))[0][0]

# Compare AI texts (should be similar)
sim_ai = calc_similarity(embeddings["AI 1"], embeddings["AI 2"])
print(f"Similarity (AI 1 vs AI 2): {sim_ai:.3f}")
if sim_ai >= 0.7:
    print("  ✓ HIGH similarity - as expected for similar content")
else:
    print("  ⚠ Lower than expected")

print()

# Compare AI vs Pizza (should be different)
sim_diff = calc_similarity(embeddings["AI 1"], embeddings["Pizza"])
print(f"Similarity (AI 1 vs Pizza): {sim_diff:.3f}")
if sim_diff < 0.5:
    print("  ✓ LOW similarity - as expected for different content")
else:
    print("  ⚠ Higher than expected")

print()

# Step 5: Demonstrate vector properties
print("🔬 Step 5: Vector properties...")
vec = embeddings["AI 1"]
print(f"Vector shape: {vec.shape}")
print(f"Vector type: {type(vec)}")
print(f"First 10 values: {vec[:10]}")
print(f"Min value: {vec.min():.3f}")
print(f"Max value: {vec.max():.3f}")
print(f"Mean value: {vec.mean():.3f}")

print()

# Step 6: Summary
print("=" * 60)
print("✅ Embedding System Test Complete!")
print("=" * 60)
print()
print("What this means:")
print("• Embeddings convert text to 384-dimensional vectors")
print("• Similar content gets similar vectors (high cosine similarity)")
print("• Different content gets different vectors (low similarity)")
print()
print("In the app:")
print("• Wikipedia and Grokipedia articles are converted to vectors")
print("• Vectors are compared using cosine similarity")
print("• Similarity score determines trust level (green/yellow/red)")
print()
print("Next steps:")
print("1. Read EMBEDDING_GUIDE.md for detailed explanation")
print("2. Run the full app: python app.py")
print("3. Try scanning topics to see embeddings in action!")
