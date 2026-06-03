self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'GymLog', {
      body: data.body || "C'est l'heure de t'entraîner !",
      icon: '/apple-icon',
      badge: '/icon',
      tag: data.tag || 'gymlog-reminder',
      renotify: true,
      data: { url: data.url || '/' },
      vibrate: data.vibrate || [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      return clients.openWindow(event.notification.data?.url || '/')
    })
  )
})
