import mediasoup from "mediasoup";

let worker;

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000
  }
];

export async function getRouter() {
  if (!worker) {
    worker = await mediasoup.createWorker({
      rtcMinPort: 20000,
      rtcMaxPort: 20200
    });

    console.log(" mediasoup worker created");
  }

  return worker.createRouter({ mediaCodecs });
}
