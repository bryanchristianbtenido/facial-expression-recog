<template>
  <v-container fluid class="py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" class="text-center">
        <h2 class="mb-4">🧠 Facial Expression Detection</h2>

        <v-btn
          color="deep-purple accent-4"
          class="mb-6 white--text"
          large
          :loading="loading"
          :disabled="detecting"
          @click="startDetection"
        >
          <v-icon left>mdi-face-recognition</v-icon>
          {{ loading ? 'Starting...' : 'Start Detection' }}
        </v-btn>

        <video
          v-show="detecting"
          ref="video"
          autoplay
          muted
          playsinline
          class="rounded"
          style="width: 100%; max-width: 600px; height: auto"
        />

        <div class="mt-4" v-if="Object.keys(expressions).length">
          <v-chip
            v-for="(value, emotion) in expressions"
            :key="emotion"
            :color="value > 0.5 ? 'deep-purple accent-4' : 'grey darken-2'"
            class="ma-2 white--text"
          >
            {{ emotion }}: {{ (value * 100).toFixed(1) }}%
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      detecting: false,
      expressions: {}
    }
  },
  methods: {
    async startDetection() {
      this.loading = true

      try {
        const video = this.$refs.video

        // Load face-api models
        await this.$faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await this.$faceapi.nets.faceExpressionNet.loadFromUri('/models')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        })

        video.srcObject = stream

        video.onloadedmetadata = () => {
          video.play()
          this.detecting = true
          this.loading = false
          this.detectLoop()
        }
      } catch (err) {
        this.loading = false
        alert('Camera access denied or not available.')
        console.error(err)
      }
    },

    async detectLoop() {
      const video = this.$refs.video
      const options = new this.$faceapi.TinyFaceDetectorOptions({ inputSize: 160 })

      const loop = async () => {
        const result = await this.$faceapi
          .detectSingleFace(video, options)
          .withFaceExpressions()

        if (result?.expressions) {
          this.expressions = result.expressions
        }

        requestAnimationFrame(loop)
      }

      loop()
    }
  }
}
</script>
