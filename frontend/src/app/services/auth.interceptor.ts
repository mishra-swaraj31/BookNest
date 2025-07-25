import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Get the token from localStorage
  const token = localStorage.getItem('access_token');
  
  // If token exists, add it to the Authorization header
  if (token) {
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authRequest);
  }
  
  // For demo purposes, we'll always proceed with the original request
  // even if no token exists, since we've modified the backend to use a default user
  return next(request);
};