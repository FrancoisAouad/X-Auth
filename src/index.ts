import authService from './auth/auth.services';
import setTokens from './lib/jwt/configJWT';
import verifyTokens from './lib/jwt/verifyJWT';

export default { authService, setTokens, verifyTokens };
