---
title: "The challenge of writting a on-demand transcoder"
description: ""
date: 2024-04-12
draft: true
tags: ["ffmpeg", "kyoo"]
---

For [Kyoo](https://github.com/zoriya/kyoo), I need to play video to a variety of clients (from browsers to TVs and mobile apps). Clients does not always support the video codec of the source video since videos are user provided and any valid video should work everywhere.

Users don't always have a stable connection, but they should be able to play their video, even if they are on a train. Those constraints mean that Kyoo needs a service to change videos codec and file size (transcode) on the fly. Why on the fly? Because we don't want users to store all their videos 5 times (the original, a 480p version, a 720p version and so on).

## The goal

To put the goal list into text we want a service capable of:
 - Streaming a video file
 - Allow users to select the video quality
 - Allow clients to automatically select the best video quality it can play (and auto-switch)
 - Prefer the original video if it can be played by the device/connection speed

The last point is particularly important since Kyoo is self-hosted and user's servers are not always powerful enough to always transcode video.

As for any video services, the following points should also be satisfied:
 - Start playing fast (we don't want to wait 30s to start watching a movie)
 - Allow users to seek anywhere on the media at any point

## The constraints

To allow clients to change quality when the connection's speed changes, two standards exist. HLS and Dash. Both are widely supported and offer the same benefits and constraints. I used HLS, but the two could be used interchangeably without too much issue.

I'm going to give you a brief overview of what HLS looks like. It consists of 3 types of files:

 - Segments, small chunks (should be between 2s and 10s) of video or audio (in a .ts or .mp4 container).
 - Index/segments playlist (.m3u8), a file listing every segments' URL and their length.
 - Master playlists (.m3u8) that contains the list of variants (720p, 1080p, 4k...).
<details>
<summary>Example index.m3u8 playlist</summary>

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-ALLOW-CACHE:YES
#EXT-X-TARGETDURATION:4
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-INDEPENDENT-SEGMENTS
#EXTINF:8.800000
segment-0.ts
#EXTINF:6.048000
segment-1.ts
#EXTINF:5.172000
segment-2.ts
...
#EXTINF:3.712000
segment-258.ts
#EXTINF:6.507000
segment-259.ts
#EXT-X-ENDLIST
```
</details>

<details>

<summary>Example master.m3u8 playlist</summary>

```m3u8
#EXTM3U
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1440118,BANDWIDTH=1728141,RESOLUTION=1280x720,AUDIO="audio",CLOSED-CAPTIONS=NONE
./original/index.m3u8
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=400000,BANDWIDTH=700000,RESOLUTION=427x240,CODECS="avc1.640028",AUDIO="audio",CLOSED-CAPTIONS=NONE
./240p/index.m3u8
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=800000,BANDWIDTH=1400000,RESOLUTION=640x360,CODECS="avc1.640028",AUDIO="audio",CLOSED-CAPTIONS=NONE
./360p/index.m3u8
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=1200000,BANDWIDTH=2100000,RESOLUTION=853x480,CODECS="avc1.640028",AUDIO="audio",CLOSED-CAPTIONS=NONE
./480p/index.m3u8
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Stereo",URI="./audio/0/index.m3u8"
```

</details>

Now that we know what we want, let's talk about what's stopping us from doing what we want.


## The bugs of ffmpeg

## Don't be afraid of failures

I wrote the transcoder in C, rewrote it in rust and finally rewrote it again in golang.

<!-- vim: wrap -->

