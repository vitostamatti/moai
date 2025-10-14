"""Tests for Set model"""

from moai.sets import Set


class TestSet:
    """Tests for Set model"""

    def test_create_integer_set(self):
        """Test creating a set with integer elements"""
        s = Set.create("I", [1, 2, 3, 4, 5])
        assert s.name == "I"
        assert s.elements == [1, 2, 3, 4, 5]

    def test_create_string_set(self):
        """Test creating a set with string elements"""
        s = Set.create("Cities", ["NYC", "LA", "Chicago"])
        assert s.name == "Cities"
        assert s.elements == ["NYC", "LA", "Chicago"]

    def test_create_empty_set(self):
        """Test creating an empty set"""
        s = Set.create("Empty", [])
        assert s.name == "Empty"
        assert s.elements == []

    def test_iter_elements(self):
        """Test iterating over set elements"""
        s = Set.create("I", [1, 2, 3])
        elements = list(s.iter_elements())
        assert elements == [1, 2, 3]

    def test_iter_empty_set(self):
        """Test iterating over an empty set"""
        s = Set.create("Empty", [])
        elements = list(s.iter_elements())
        assert elements == []

    def test_model_validate(self):
        """Test validating a set from dict"""
        s = Set.model_validate({"name": "Test", "elements": [1, 2, 3]})
        assert s.name == "Test"
        assert s.elements == [1, 2, 3]

    def test_duplicate_elements(self):
        """Test creating a set with duplicate elements (should preserve duplicates)"""
        s = Set.create("Dup", [1, 2, 2, 3, 3, 3])
        # Note: Set model doesn't enforce uniqueness, it's a list
        assert s.elements == [1, 2, 2, 3, 3, 3]
        assert len(s.elements) == 6
