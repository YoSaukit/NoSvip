namespace NoSvip.Web.Hubs
{
    /// <summary>
    /// 房间信息
    /// </summary>
    public class Room
    {
        /// <summary>
        /// 房间号
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// 房间名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 链接 Id
        /// </summary>
        public string HostConnectionId { get; set; }
    }
}