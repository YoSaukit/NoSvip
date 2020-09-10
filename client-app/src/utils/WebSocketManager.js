import { HubConnectionBuilder } from '@microsoft/signalr'

const connection = new HubConnectionBuilder()
    .withUrl("/p2p")
    .build();

async function start() {
    try {
        await connection.start()
        console.log('connected')
    } catch (err) {
        console.log(err)
        setTimeout(() => start(), 100)
    }
}

connection.onclose(async () => {
    await start()
});

export default connection