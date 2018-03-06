/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'https://developean.com/index.html',
  'https://developean.com/', // Alias for index.html
  'https://developean.com/assets/web/assets/mobirise-icons/mobirise-icons.css',
  'https://developean.com/assets/tether/tether.min.css',
  'https://developean.com/assets/bootstrap/css/bootstrap.min.css',
  'https://developean.com/assets/bootstrap/css/bootstrap-grid.min.css',
  'https://developean.com/assets/bootstrap/css/bootstrap-reboot.min.css',
  'https://developean.com/assets/socicon/css/styles.css',
  'https://developean.com/assets/dropdown/css/style.css',
  'https://developean.com/assets/theme/css/style.css',
  'https://developean.com/assets/mobirise/css/mbr-additional.css',
  'https://developean.com/assets/mobirise/css/custom.css',
  'https://developean.com/assets/web/assets/jquery/jquery.min.js',
  'https://developean.com/assets/popper/popper.min.js',
  'https://developean.com/assets/tether/tether.min.js',
  'https://developean.com/assets/bootstrap/js/bootstrap.min.js',
  'https://developean.com/assets/smoothscroll/smooth-scroll.js',
  'https://developean.com/assets/ytplayer/jquery.mb.ytplayer.min.js',
  'https://developean.com/assets/vimeoplayer/jquery.mb.vimeo_player.js',
  'https://developean.com/assets/touchswipe/jquery.touch-swipe.min.js',
  'https://developean.com/assets/bootstrapcarouselswipe/bootstrap-carousel-swipe.js',
  'https://developean.com/assets/mbr-flip-card/mbr-flip-card.js',
  'https://developean.com/assets/mbr-clients-slider/mbr-clients-slider.js',
  'https://developean.com/assets/viewportchecker/jquery.viewportchecker.js',
  'https://developean.com/assets/mbr-popup-btns/mbr-popup-btns.js',
  'https://developean.com/assets/dropdown/js/script.min.js',
  'https://developean.com/assets/parallax/jarallax.min.js',
  'https://developean.com/assets/theme/js/script.js',
  'https://developean.com/assets/slidervideo/script.js',
  'https://developean.com/assets/formoid/formoid.min.js'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
