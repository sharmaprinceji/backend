export const rooms = new Map();

export function getOrCreateRoom(roomId, router) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      router,
      peers: new Map()
    });
  }
  return rooms.get(roomId);
}
