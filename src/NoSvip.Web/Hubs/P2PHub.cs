using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace NoSvip.Web.Hubs
{
    /// <summary>
    /// 
    /// </summary>
    public class P2PHub : Hub
    {
        private static readonly RoomManager RoomManager = new RoomManager();

        public override Task OnDisconnectedAsync(Exception exception)
        {
            RoomManager.DeleteRoom(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// 创建房间
        /// </summary>
        /// <returns></returns>
        public async Task CreateRoom()
        {
            var room = RoomManager.CreateRoom(Context.ConnectionId);
            if (room != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, room.Id);
                await Clients.Caller.SendAsync("created", room.Id);
            }
            else
            {
                await Clients.Caller.SendAsync("error", "error occurred when creating a new room.");
            }
        }

        /// <summary>
        /// 加入房间
        /// </summary>
        /// <param name="roomId"></param>
        /// <returns></returns>
        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Caller.SendAsync("joined", roomId);
            await Clients.Group(roomId).SendAsync("ready");

            if (int.TryParse(roomId, out var id))
            {
                RoomManager.DeleteRoom(id);
            }
        }

        public async Task LeaveRoom(string roomId)
        {
            await Clients.Group(roomId).SendAsync("bye");
        }

        public async Task SendMessage(string roomId, object message)
        {
            await Clients.OthersInGroup(roomId).SendAsync("message", message);
        }
    }
}