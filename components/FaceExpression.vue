<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" class="text-center">
        <h2 class="mb-6">🧠 Facial Expression Detection</h2>

        <!-- Video Preview -->
        <v-sheet
          elevation="4"
          class="mx-auto rounded-lg overflow-hidden"
          max-width="600"
        >
          <video
            ref="video"
            autoplay
            muted
            playsinline
            style="width: 100%; height: auto;"
          />
        </v-sheet>

        <!-- Controls -->
        <div class="my-4">
          <v-btn
            :color="isRunning ? 'error' : 'success'"
            class="mr-2"
            rounded
            large
            @click="toggleCamera"
          >
            <v-icon left>{{ isRunning ? 'mdi-stop' : 'mdi-play' }}</v-icon>
            {{ isRunning ? 'Stop' : 'Start' }}
          </v-btn>

          <v-btn
            color="primary"
            rounded
            large
            @click="flipCamera"
            :disabled="!isRunning"
          >
            <v-icon left>mdi-camera-switch</v-icon>
            Flip Camera
          </v-btn>
        </div>

        <!-- Expressions -->
        <v-row justify="center" class="mt-4">
          <v-chip
            v-for="(value, emotion) in expressions"
            :key="emotion"
            :color="value > 0.5 ? 'deep-purple accent-4' : 'grey darken-2'"
            class="ma-2 white--text"
          >
            {{ emotion }}: {{ (value * 100).toFixed(1) }}%
          </v-chip>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      expressions: {},
      isRunning: false,
      currentStream: null,
      usingFrontCamera: true,
      detectionLoopHandle: null
    }
  },
  methods: {
    async toggleCamera() {
      if (this.isRunning) {
        this.stopCamera()
      } else {
        await this.startCamera()
      }
    },

    async startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: this.usingFrontCamera ? 'user' : 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.currentStream = stream
        const video = this.$refs.video
        video.srcObject = stream
        video.onloadedmetadata = () => {
          video.play()
          this.detectLoop()
        }

        this.isRunning = true
      } catch (err) {
        alert('Failed to access camera')
        console.error(err)
      }
    },

    stopCamera() {
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop())
        this.currentStream = null
      }

      this.isRunning = false
      cancelAnimationFrame(this.detectionLoopHandle)
      this.expressions = {}
    },

    async flipCamera() {
      this.stopCamera()
      this.usingFrontCamera = !this.usingFrontCamera
      await this.startCamera()
    },

    async detectLoop() {
      const video = this.$refs.video
      const options = new this.$faceapi.TinyFaceDetectorOptions({ inputSize: 160 })

      const loop = async () => {
        if (!this.isRunning) return
        const result = await this.$faceapi
          .detectSingleFace(video, options)
          .withFaceExpressions()

        if (result && result.expressions) {
          this.expressions = result.expressions
        }

        this.detectionLoopHandle = requestAnimationFrame(loop)
      }

      loop()
    }
  },
  beforeDestroy() {
    this.stopCamera()
  }
}
</script>

<style scoped>
video {
  border-radius: 12px;
}
</style>
