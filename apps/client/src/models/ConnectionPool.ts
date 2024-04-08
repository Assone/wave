export default class ConnectionPool {
  pool = new Map<string, RTCPeerConnection>();

  delete(id: string) {
    const connection = this.pool.get(id);

    connection?.close();
    this.pool.delete(id);

    return connection;
  }

  clean() {
    this.pool.forEach((connection) => connection.close());
    this.pool.clear();
  }

  create(id: string, connection: RTCPeerConnection) {
    this.pool.set(id, connection);
  }
}
