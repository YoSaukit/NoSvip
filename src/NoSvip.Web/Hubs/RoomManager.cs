using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace NoSvip.Web.Hubs
{
    public class RoomManager
    {
        private int _nextRoomId;

        private readonly ConcurrentDictionary<int, Room> _rooms;

        public RoomManager()
        {
            _nextRoomId = 1;
            _rooms = new ConcurrentDictionary<int, Room>();
        }

        /// <summary>
        /// 创建房间
        /// </summary>
        /// <param name="connectionId"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public Room CreateRoom(string connectionId, string name = "")
        {
            _rooms.TryRemove(_nextRoomId, out _);

            var roomInfo = new Room
            {
                Id = _nextRoomId.ToString(),
                Name = name == "" ? _nextRoomId.ToString() : name,
                HostConnectionId = connectionId
            };
            var result = _rooms.TryAdd(_nextRoomId, roomInfo);

            if (!result)
                return null;

            _nextRoomId++;
            return roomInfo;
        }

        /// <summary>
        /// 删除房间
        /// </summary>
        /// <param name="roomId"></param>
        public void DeleteRoom(int roomId)
        {
            _rooms.TryRemove(roomId, out _);
        }

        /// <summary>
        /// 删除房间
        /// </summary>
        /// <param name="connectionId"></param>
        public void DeleteRoom(string connectionId)
        {
            int? correspondingRoomId = null;
            foreach (var pair in _rooms)
            {
                if (pair.Value.HostConnectionId.Equals(connectionId))
                {
                    correspondingRoomId = pair.Key;
                }
            }

            if (correspondingRoomId.HasValue)
            {
                _rooms.TryRemove(correspondingRoomId.Value, out _);
            }
        }

        /// <summary>
        /// 获取全部房间
        /// </summary>
        /// <returns></returns>
        public List<Room> GetAllRooms()
        {
            return _rooms.Values.ToList();
        }
    }
}