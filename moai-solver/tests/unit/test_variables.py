"""Tests for Variable model"""

from moai.variables import Variable


class TestVariable:
    """Tests for Variable model"""

    def test_create_basic_variable(self):
        """Test creating a basic variable with default parameters"""
        v = Variable.create(name="x")
        assert v.name == "x"
        assert v.domain == "NonNegativeReals"
        assert v.indices == []
        assert v.lb is None
        assert v.ub is None

    def test_create_binary_variable(self):
        """Test creating a binary variable"""
        v = Variable.create("y", domain="Binary")
        assert v.name == "y"
        assert v.domain == "Binary"
        assert v.is_binary()
        assert v.is_integer()
        assert not v.is_continuous()

    def test_create_integer_variable(self):
        """Test creating an integer variable"""
        v = Variable.create("z", domain="Integers")
        assert v.name == "z"
        assert v.domain == "Integers"
        assert v.is_integer()
        assert not v.is_binary()
        assert not v.is_continuous()

    def test_create_nonnegative_integer_variable(self):
        """Test creating a non-negative integer variable"""
        v = Variable.create("n", domain="NonNegativeIntegers")
        assert v.name == "n"
        assert v.domain == "NonNegativeIntegers"
        assert v.is_integer()
        assert not v.is_binary()
        assert not v.is_continuous()

    def test_create_real_variable(self):
        """Test creating a real variable"""
        v = Variable.create("r", domain="Reals")
        assert v.name == "r"
        assert v.domain == "Reals"
        assert v.is_continuous()
        assert not v.is_integer()
        assert not v.is_binary()

    def test_create_nonnegative_real_variable(self):
        """Test creating a non-negative real variable"""
        v = Variable.create("p", domain="NonNegativeReals")
        assert v.name == "p"
        assert v.domain == "NonNegativeReals"
        assert v.is_continuous()
        assert not v.is_integer()

    def test_create_with_bounds(self):
        """Test creating a variable with lower and upper bounds"""
        v = Variable.create("x", lb=0.0, ub=10.0)
        assert v.lb == 0.0
        assert v.ub == 10.0

    def test_create_with_only_lower_bound(self):
        """Test creating a variable with only lower bound"""
        v = Variable.create("x", lb=5.0)
        assert v.lb == 5.0
        assert v.ub is None

    def test_create_with_only_upper_bound(self):
        """Test creating a variable with only upper bound"""
        v = Variable.create("x", ub=100.0)
        assert v.lb is None
        assert v.ub == 100.0

    def test_create_indexed_variable_single_index(self):
        """Test creating a variable with a single index"""
        v = Variable.create("x", indices=["I"])
        assert v.name == "x"
        assert v.indices == ["I"]
        assert v.dimension == 1

    def test_create_indexed_variable_multiple_indices(self):
        """Test creating a variable with multiple indices"""
        v = Variable.create("flow", indices=["I", "J", "K"])
        assert v.name == "flow"
        assert v.indices == ["I", "J", "K"]
        assert v.dimension == 3

    def test_dimension_zero(self):
        """Test dimension of a non-indexed variable"""
        v = Variable.create(name="scalar")
        assert v.dimension == 0

    def test_dimension_one(self):
        """Test dimension of a single-indexed variable"""
        v = Variable.create("x", indices=["I"])
        assert v.dimension == 1

    def test_dimension_multiple(self):
        """Test dimension of a multi-indexed variable"""
        v = Variable.create("x", indices=["I", "J"])
        assert v.dimension == 2

    def test_model_validate(self):
        """Test validating a variable from dict"""
        v = Variable.model_validate(
            {"name": "x", "indices": ["I", "J"], "domain": "Binary", "lb": 0, "ub": 1}
        )
        assert v.name == "x"
        assert v.indices == ["I", "J"]
        assert v.domain == "Binary"
        assert v.lb == 0
        assert v.ub == 1

    def test_binary_properties(self):
        """Test properties of binary variable"""
        v = Variable.create("b", domain="Binary")
        assert v.is_binary()
        assert v.is_integer()
        assert not v.is_continuous()

    def test_integer_properties(self):
        """Test properties of integer variable"""
        v = Variable.create("i", domain="Integers")
        assert not v.is_binary()
        assert v.is_integer()
        assert not v.is_continuous()

    def test_continuous_properties(self):
        """Test properties of continuous variable"""
        v = Variable.create("c", domain="NonNegativeReals")
        assert not v.is_binary()
        assert not v.is_integer()
        assert v.is_continuous()

    def test_all_domains(self):
        """Test creating variables with all domain types"""
        v1 = Variable.create("x", domain="Binary")
        assert v1.domain == "Binary"

        v2 = Variable.create("x", domain="NonNegativeIntegers")
        assert v2.domain == "NonNegativeIntegers"

        v3 = Variable.create("x", domain="NonNegativeReals")
        assert v3.domain == "NonNegativeReals"

        v4 = Variable.create("x", domain="Reals")
        assert v4.domain == "Reals"

        v5 = Variable.create("x", domain="Integers")
        assert v5.domain == "Integers"
