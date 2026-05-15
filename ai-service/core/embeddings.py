import logging
from functools import lru_cache
from typing import List, Optional, Union

import numpy as np

from core.config import settings

logger = logging.getLogger(__name__)

_embedding_model = None


def _load_model():
    global _embedding_model

    if _embedding_model is not None:
        return _embedding_model

    try:
        from sentence_transformers import SentenceTransformer
        import torch

        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
        logger.info(f"Device: {settings.MODEL_DEVICE}")

        _embedding_model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME,
            device=settings.MODEL_DEVICE,
        )

        # Verify the model loaded correctly
        test_embedding = _embedding_model.encode("test", convert_to_numpy=True)
        actual_dim = test_embedding.shape[0]
        logger.info(
            f"Embedding model loaded successfully. "
            f"Embedding dimension: {actual_dim}"
        )

        return _embedding_model

    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")
        logger.warning("Falling back to TF-IDF based similarity (no multilingual support)")
        _embedding_model = None
        return None


class EmbeddingEngine:

    def __init__(self):
        self._model = None
        self._fallback_mode = False

    @property
    def model(self):
        if self._model is None:
            self._model = _load_model()
            if self._model is None:
                self._fallback_mode = True
        return self._model

    @property
    def is_multilingual(self) -> bool:
        return not self._fallback_mode and self.model is not None

    def encode(self, text: str) -> np.ndarray:
        if not text or not text.strip():
            return np.zeros(settings.EMBEDDING_DIMENSION)

        if self.model is not None:
            embedding = self.model.encode(
                text.strip(),
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            return embedding

        return self._fallback_encode(text)

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, settings.EMBEDDING_DIMENSION))

        cleaned = [t.strip() if t else "" for t in texts]

        if self.model is not None:
            embeddings = self.model.encode(
                cleaned,
                convert_to_numpy=True,
                normalize_embeddings=True,
                batch_size=32,
                show_progress_bar=False,
            )
            return embeddings

        return np.array([self._fallback_encode(t) for t in cleaned])

    def similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        if vec_a.ndim == 0 or vec_b.ndim == 0:
            return 0.0

        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))

    def skill_match_score(self, user_skills: List[str], required_skills: List[str]) -> float:
        if not user_skills or not required_skills:
            return 0.0

        user_vecs = self.encode_batch(user_skills)
        required_vecs = self.encode_batch(required_skills)

        if user_vecs.shape[0] == 0 or required_vecs.shape[0] == 0:
            return 0.0

        # For each required skill, find the maximum similarity with any user skill
        best_matches = []
        for req_vec in required_vecs:
            similarities = [self.similarity(req_vec, u_vec) for u_vec in user_vecs]
            best_matches.append(max(similarities))

        return float(np.mean(best_matches))

    def _fallback_encode(self, text: str) -> np.ndarray:
        from sklearn.feature_extraction.text import HashingVectorizer

        vectorizer = HashingVectorizer(
            n_features=settings.EMBEDDING_DIMENSION,
            alternate_sign=False,
            norm="l2",
        )
        vec = vectorizer.transform([text.lower()]).toarray()[0]
        return vec


_engine_instance: Optional[EmbeddingEngine] = None


def get_embedding_engine() -> EmbeddingEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = EmbeddingEngine()
    return _engine_instance
