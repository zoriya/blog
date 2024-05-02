---
title: "The challenge of writting a on-demand transcoder"
description: ""
date: 2024-04-12
draft: true
tags: ["ffmpeg", "kyoo"]
---

For [Kyoo](https://github.com/zoriya/kyoo), I need to play video on a variety of clients (browsers, TVs, mobile apps). Clients does not always support the video codec of the source video since videos are user provided. Any valid video should work everywhere. Users should not have to worry about converting videos for Kyoo to work, everything should Work™ the first time.

Users don't always have a stable connection, but they should be able to play their video, even if they are on a train. Those constraints mean that Kyoo needs a service to change videos codec and file size (transcode) on the fly. Why on the fly? Because we don't want users to store all their videos 5 times (the original, a 480p version, a 720p version and so on).

## The goal

To put the goal list into text we want a service capable of:
 - Streaming a video file
 - Allow users to select the video quality
 - Allow clients to automatically select the best video quality it can play (and auto-switch when internet speed changes)
 - Prefer the original video if it can be played by the device/connection speed

The last point is particularly important since Kyoo is self-hosted and user's servers are not always powerful enough to always transcode video.

As for any video services, the following points should also be satisfied:
 - Start playing fast (we don't want to wait 30s to start watching a movie)
 - Allow users to seek anywhere on the media at any point

## The constraints

To allow clients to change quality when the connection's speed changes, two standards exist. HLS and Dash. Both are widely supported and offer the same benefits and constraints. I used HLS, but I believe the two could be used interchangeably without too much issue.

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

Now that we know what we want, let's talk about how we could proceed.

## Initial idea 

When I think of videos, my first thought initially goes to ffmpeg. As always, ffmpeg does support HLS with the following command:

```bash
ffmpeg -i in.mkv -f hls ...
```

But this approach has a few caveats. The most important one is the time it takes. This command will produce HLS segments one at a time starting from the first. Streaming this file will show users a video of 30s growing until the command has finished.

![vlc gif of this command playback]

The user can't seek past the transcoded end
If we want to have automatic quality switches, we need a command like this:

```bash
ffmpeg -map
```

This command will eagerly transcode the video in all qualities ; killing the server's performances while doing so.

## Wrap ffmpeg

The master playlist we saw earlier is pretty simple (and human readable!). We could manually generate it and create transcode streams only when they are requested. This was my initial approach and it's pretty simple to implement but it has a major flaw.

What happens when you switch quality? Your player will fetch the index.m3u8 file for the new quality. Receiving this request, the server will start a new transcode and give back the index file. Let's pretend your client was playing the 150th segment at 5min of your movie. The newly retrieved index.m3u8 just started transcoding so it might only have 50 segments in it. Your player will not be able to request the segment 150 of the new quality (since it does not exist yet) and start playing at the 45th segment (to keep a margin from the stream tip). The user will now have to rewatch part of the movie or wait for the transcoder to catch up and manually seek.

So how should we fix that? The obvious idea is to start the new encode directly at the requested segment so users don't have to wait. While the idea is pretty simple, actually implementing it is a lot harder.
First of all, you want to start the transcode at a specific segment but you don't know the start time in seconds of that segment. And even if we knew the start time of the segment, we can't simply remove previous segments from the index.m3u8 file. Its illegal to do so and the player would not be able to seek before in the video.

In truth, HLS has another rule: each variants needs to have the same segments as the others. I'll steel a diagram from a twitch's blog:

![twitch image]

To specify segments length we can either use `-segment_time` to specify a single length for all segments or we can use `-segment_times` and specify an array of length with one value per segment.
That's great and you might think this solves the issue but the main constraints of segment has yet to come: Segments needs to start by a keyframe.

What's a keyframe you might ask: it's an independent frame (I-frame) in a video stream. Think of it has an image. Video frames can either be independent (keyframes) or dependant on a keyframe. A dependant keyframe does not store the whole image but the differences relative to another keyframe (a keyframe before for a B-frame and a keyframe after for a P-frame)

![i frame graph]

Great so just put a keyframe every time we create a segment, no? Well yes and no. It would be easy to do so when we transcode, there is a ffmpeg option for that: `-force_keyframe 2` will force a keyframe every 2 seconds. But what about times when we simply copy the video stream? 

It's important to allow playback of the original video stream without re-encoding it since it offers the best video quality. It is also way faster to process on the server. With this enabled even playing on a raspberry pi is doable.

So we absolutely need to allow playback of the original video stream, where we have no control of keyframes. There can be a keyframe every frame or we could have 3 minutes of video without any keyframes. Segments still need to start with a keyframe, even in original quality.

## Allowing original playback

There is only one way to meet the previously stated constraints: giving up control on fixed segments length and aligning on keyframes. Instead of creating a segment every 4s, we scan the whole video and extract keyframes timestamps and create a new segment only on one of those timestamps.

When creating the hls stream from the original video stream, we simply cut it at a previously extracted keyframes. For transcoded stream, we force keyframes and segments cut exactly like before but we use the original's video keyframes as a reference.


## The bugs of ffmpeg

## Don't be afraid of failures

I wrote the transcoder in C, rewrote it in rust and finally rewrote it again in golang.

<!-- vim: wrap -->

