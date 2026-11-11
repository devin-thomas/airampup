type PagesContext = {
  readonly request: Request;
  readonly env: { readonly INQUIRY_SERVICE: Fetcher };
};
type Fetcher = { fetch(request: Request): Promise<Response> };
export function onRequest(context: PagesContext): Promise<Response> {
  return context.env.INQUIRY_SERVICE.fetch(context.request);
}
