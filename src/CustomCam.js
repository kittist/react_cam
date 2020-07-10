import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  container: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '100%',
    height: '100%', 
    overflow: 'hidden',
  },
  video: {
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: '0'
  },
  mirror: {
    transform: 'translate(-50%,-50%) scale(-1,1) !important'
  },
  canvas: {
    display: 'none'
  }
}))

const CustomCamera = forwardRef(
  ({ getCamData, currentIndex, mirror, height, width }, ref) => {
    const [isInit, setInit] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [isMirror, setIsMirror] = useState(false);

    useImperativeHandle(ref, () => ({
      getSnap() {
        let videoEl = document.getElementById('inputVideo')
        if (videoEl.paused || videoEl.ended) return null
        let canvas = document.getElementById('custom-cam-video-canvas')
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        let ctx = canvas.getContext('2d')
        if (isMirror) {    
          ctx.translate(videoEl.videoWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
        const base64 = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); 
        return { base64, size: [videoEl.videoWidth, videoEl.videoHeight] }
      },
      getCanvas(canvasId) {
        let videoEl = document.getElementById('inputVideo')
        if (videoEl.paused || videoEl.ended) return null
        let canvas = document.getElementById(canvasId)
        // let canvas = document.getElementById('custom-cam-video-canvas')
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        let ctx = canvas.getContext('2d')
        if (isMirror) {    
          ctx.translate(videoEl.videoWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
        return canvas
      },
      toggleCamActive() {
        let videoEl = document.getElementById('inputVideo')
        videoEl.paused ? videoEl.play() : videoEl.pause()
      },
      toggleMirror() {
        setIsMirror(!isMirror)
      },
      switchCam(cam) {
        console.log(cam)
        setDeviceId(cam)
      }
    }));

    useEffect(() => {
      const updateVideo = async (newIndex) => {
        const video = document.getElementById('inputVideo');
        const videoV = document.getElementById('custom-cam-video-container');
        const constraints = {
          audio: false,
          video: {
            deviceId: { exact: newIndex },
            width: { min: 1024, ideal: videoV?.clientWidth, max: 1920 },
            height: { min: 576, ideal: videoV?.clientHeight, max: 1080 },
          }
        }
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
          video.srcObject = stream;
          video.play();
        });
      }
      // if (currentIndex && currentIndex !== deviceId && !isInit) {
      //   updateVideo(deviceList[currentIndex].deviceId)
      //   setDeviceId(currentIndex)
      // } 
      console.log('kk' + deviceId + isInit)
      if (deviceId !== null && !isInit) {
        updateVideo(deviceList[deviceId].deviceId)
        // setDeviceId(deviceId)
      } 
    }, [isInit, deviceId, deviceList])
    useEffect(() => {
      const launchVideo = async () => {
        const video = document.getElementById('inputVideo');
        let videoV = document.getElementById('custom-cam-video-container');
        if (height && width) video.style.cssText = videoV.style.cssText = `height: ${height}px !important; width: ${width}px !important`
        navigator.getMedia = (navigator.getUserMedia);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = {
            audio: false,
            video: {
              width: { min: 1024, ideal: videoV?.clientWidth, max: 1920 },
              height: { min: 576, ideal: videoV?.clientHeight, max: 1080 },
            }
          }
          navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
          const listDevicesX =  await navigator.mediaDevices.enumerateDevices();
          const listDevices = await listDevicesX.filter(ea => ea.kind === 'videoinput')
          setDeviceList(listDevices)
          // setDeviceId(listDevices.length-1)
          getCamData({
            currentIndex: listDevices.length-1,
            list: listDevices,
            size: [videoV?.clientWidth, videoV?.clientHeight]
          })
          video.srcObject = stream;
          video.play();
          });
        }
      }
      const init = async () => {
        await launchVideo()
        setInit(false)
      }
      init() 
    }, [setInit, getCamData, height, width])
    useEffect(() => {if (mirror !== null) setIsMirror(mirror)}, [mirror, setIsMirror])
    const classes = useStyles()
    return (
      <div className={classes.root}>      
        <div id='custom-cam-video-container' className={classes.container}>
          <video id="inputVideo" className={`${classes.video} ${isMirror ? classes.mirror : ''}`} autoPlay muted playsInline></video>
          <canvas id='custom-cam-video-canvas' className={classes.canvas} />
        </div>
      </div>
    );
  }
)

export default CustomCamera;
