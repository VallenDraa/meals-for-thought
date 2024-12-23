import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({
    url: new URL(req.url, environment.api).toString(),
  });

  return next(apiReq);
};
