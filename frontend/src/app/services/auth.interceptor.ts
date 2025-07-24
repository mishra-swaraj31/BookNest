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
  
  // Otherwise, proceed with the original request
  return next(request);
};