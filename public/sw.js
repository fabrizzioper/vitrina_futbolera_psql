const CACHE_NAME = 'v1_cache_intrasolution_app',
urlToCache = [
    './',
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
]




self.addEventListener('isntall', e=>{
    e => waitUntil(
        caches.open(CACHE_NAME)
        .then(Cache => {
            return caches.addAll(urlToCache)
            .then(() => self.skipWating())
        })
        .catch(err => console.log('Fallo registro de cache', err))
    )
})


//una vez iniciado el SW, Busca recursos para hacer que funcion e sin conexion
self.addEventListener('activate', e=>{
    const cacheWhitelist = [CACHE_NAME]
    e => waitUntil(
        caches.keys()
        .then(cachesNames => {
            cachesNames.map(cachesName => {
                //eliminar lo que ya no requerimos
                if (cacheWhitelist.indexOf(cachesName)=== -1) {
                    return caches.delete(cachesName)
                }
            })
        })
    )
})



self.addEventListener('fetch', e=>{
    e.respondWith(
        caches.match(e.request)
        .then(res => {
            if (res) {
                //recuperar cache
                return res
            }
            //recuperar peticion de url
            return fetch(e.request)
        })
    )
})