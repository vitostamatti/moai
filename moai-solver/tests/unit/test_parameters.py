"""Tests for Parameter model"""

import pytest

from moai.parameters import IndexElement, Parameter


class TestIndexElement:
    """Tests for IndexElement model"""

    def test_create_single_index(self):
        """Test creating an index element with a single index"""
        elem = IndexElement(index=[1], value=5.0)
        assert elem.index == [1]
        assert elem.value == 5.0

    def test_create_multiple_indices(self):
        """Test creating an index element with multiple indices"""
        elem = IndexElement(index=[1, 2], value=10.0)
        assert elem.index == [1, 2]
        assert elem.value == 10.0

    def test_create_string_index(self):
        """Test creating an index element with string index"""
        elem = IndexElement(index=["NYC"], value=3.5)
        assert elem.index == ["NYC"]
        assert elem.value == 3.5

    def test_matches_index_single(self):
        """Test matching a single index"""
        elem = IndexElement(index=[1], value=5.0)
        assert elem.matches_index([1])
        assert not elem.matches_index([2])

    def test_matches_index_multiple(self):
        """Test matching multiple indices"""
        elem = IndexElement(index=[1, 2], value=10.0)
        assert elem.matches_index([1, 2])
        assert not elem.matches_index([1, 3])
        assert not elem.matches_index([2, 1])

    def test_matches_index_mixed(self):
        """Test matching mixed type indices"""
        elem = IndexElement(index=[1, "A"], value=7.5)
        assert elem.matches_index([1, "A"])
        assert not elem.matches_index([1, "B"])


class TestParameter:
    """Tests for Parameter model"""

    def test_create_scalar_parameter(self):
        """Test creating a scalar parameter"""
        p = Parameter.create(name="c", values=5.0)
        assert p.name == "c"
        assert p.values == 5.0
        assert p.indices == []

    def test_create_scalar_parameter_int(self):
        """Test creating a scalar parameter with integer value"""
        p = Parameter.create(name="n", values=10)
        assert p.name == "n"
        assert p.values == 10
        assert p.indices == []

    def test_create_indexed_parameter_single_index(self):
        """Test creating a parameter with a single index"""
        elements = [
            IndexElement(index=[1], value=5.0),
            IndexElement(index=[2], value=10.0),
            IndexElement(index=[3], value=15.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        assert p.name == "cost"
        assert p.indices == ["I"]
        assert isinstance(p.values, list)
        assert len(p.values) == 3

    def test_create_indexed_parameter_multiple_indices(self):
        """Test creating a parameter with multiple indices"""
        elements = [
            IndexElement(index=[1, 1], value=5.0),
            IndexElement(index=[1, 2], value=10.0),
            IndexElement(index=[2, 1], value=15.0),
        ]
        p = Parameter.create(name="distance", values=elements, indices=["I", "J"])
        assert p.name == "distance"
        assert p.indices == ["I", "J"]
        assert isinstance(p.values, list)
        assert len(p.values) == 3

    def test_get_value_scalar(self):
        """Test getting value from a scalar parameter"""
        p = Parameter.create(name="c", values=5.0)
        # Scalar parameters return the same value for any index
        assert p.get_value([]) == 5.0
        assert p.get_value([1]) == 5.0
        assert p.get_value([1, 2]) == 5.0

    def test_get_value_indexed_single(self):
        """Test getting value from a single-indexed parameter"""
        elements = [
            IndexElement(index=[1], value=5.0),
            IndexElement(index=[2], value=10.0),
            IndexElement(index=[3], value=15.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        assert p.get_value([1]) == 5.0
        assert p.get_value([2]) == 10.0
        assert p.get_value([3]) == 15.0

    def test_get_value_indexed_multiple(self):
        """Test getting value from a multi-indexed parameter"""
        elements = [
            IndexElement(index=[1, 1], value=5.0),
            IndexElement(index=[1, 2], value=10.0),
            IndexElement(index=[2, 1], value=15.0),
        ]
        p = Parameter.create(name="distance", values=elements, indices=["I", "J"])
        assert p.get_value([1, 1]) == 5.0
        assert p.get_value([1, 2]) == 10.0
        assert p.get_value([2, 1]) == 15.0

    def test_get_value_not_found(self):
        """Test getting value for a non-existent index raises KeyError"""
        elements = [
            IndexElement(index=[1], value=5.0),
            IndexElement(index=[2], value=10.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        with pytest.raises(KeyError):
            p.get_value([3])

    def test_get_value_string_index(self):
        """Test getting value with string indices"""
        elements = [
            IndexElement(index=["NYC"], value=5.0),
            IndexElement(index=["LA"], value=10.0),
        ]
        p = Parameter.create(name="demand", values=elements, indices=["Cities"])
        assert p.get_value(["NYC"]) == 5.0
        assert p.get_value(["LA"]) == 10.0

    def test_has_index_scalar(self):
        """Test has_index for scalar parameter"""
        p = Parameter.create(name="c", values=5.0)
        # Scalar parameters are considered to have any index
        assert p.has_index([])
        assert p.has_index([1])
        assert p.has_index([1, 2])

    def test_has_index_single(self):
        """Test has_index for single-indexed parameter"""
        elements = [
            IndexElement(index=[1], value=5.0),
            IndexElement(index=[2], value=10.0),
        ]
        p = Parameter.create(name="cost", values=elements, indices=["I"])
        assert p.has_index([1])
        assert p.has_index([2])
        assert not p.has_index([3])

    def test_has_index_multiple(self):
        """Test has_index for multi-indexed parameter"""
        elements = [
            IndexElement(index=[1, 1], value=5.0),
            IndexElement(index=[1, 2], value=10.0),
        ]
        p = Parameter.create(name="distance", values=elements, indices=["I", "J"])
        assert p.has_index([1, 1])
        assert p.has_index([1, 2])
        assert not p.has_index([2, 1])
        assert not p.has_index([1, 3])

    def test_has_index_wrong_length(self):
        """Test has_index with wrong index length raises ValueError"""
        elements = [
            IndexElement(index=[1, 1], value=5.0),
        ]
        p = Parameter.create(name="distance", values=elements, indices=["I", "J"])
        with pytest.raises(ValueError, match="Index length"):
            p.has_index([1])
        with pytest.raises(ValueError, match="Index length"):
            p.has_index([1, 2, 3])

    def test_has_index_empty_indices(self):
        """Test has_index for parameter with no indices but list values"""
        # This is a corner case - parameter has values but no indices defined
        elements = [
            IndexElement(index=[], value=5.0),
        ]
        p = Parameter.create(name="test", values=elements, indices=[])
        # Should return False as there are no indices
        assert not p.has_index([1])

    def test_model_validate(self):
        """Test validating a parameter from dict"""
        p = Parameter.model_validate(
            {
                "name": "cost",
                "indices": ["I"],
                "values": [
                    {"index": [1], "value": 5.0},
                    {"index": [2], "value": 10.0},
                ],
            }
        )
        assert p.name == "cost"
        assert p.indices == ["I"]
        assert isinstance(p.values, list)
        assert len(p.values) == 2
        assert p.get_value([1]) == 5.0

    def test_parameter_with_mixed_index_types(self):
        """Test parameter with mixed string and integer indices"""
        elements = [
            IndexElement(index=[1, "A"], value=5.0),
            IndexElement(index=[2, "B"], value=10.0),
        ]
        p = Parameter.create(name="matrix", values=elements, indices=["I", "J"])
        assert p.get_value([1, "A"]) == 5.0
        assert p.get_value([2, "B"]) == 10.0
        assert not p.has_index([1, "B"])
