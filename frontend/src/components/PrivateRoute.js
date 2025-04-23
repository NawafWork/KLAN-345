import { Navigate } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  loading: state.auth.loading
});

export default connect(mapStateToProps)(PrivateRoute);