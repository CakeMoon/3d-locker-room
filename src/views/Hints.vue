<template>
  <div class="page">
    <NavBar/>
    <div class="content">
      <transition name="fade">
      <div v-if="!loading"  class="content-text">
        <div class="content-title">
          <h1>{{ tittle }}</h1>
          <h2>welcome to your locker</h2>
          <h2>room for virtual gund!</h2>
        </div>
        <div class="content-section">
          <h3>To arrange your assets in 3D, navigate to "Preview" tag</h3>
          <p>-You can move your view around and move objects you uploaded</p>
        </div>
        <div class="content-section">
          <h3>To upload images, navigate to "Images" tag</h3>
          <p>- Please upload your images in jpg format </p>
        </div>
        <div class="content-section">
          <h3>To upload 3d models, navigate to "3D-Models" tag</h3>
          <p>- Please upload a single file in "gltf" or "glb" file</p>
        </div>
        <div class="content-section">
          <h3>To leave your locker room, hit "Log Out" tag</h3>
        </div>
      </div>
      </transition>
    </div>
  </div>
</template>

<script>
import NavBar from '../components/NavBar';

export default {
  name: "Hints",

  components: {
    NavBar,
  },

  data() {
    return {
      username: "",
      tittle:"",
      loading: true,
      a: false,
      show: false
    }
  },

  created: function() {
    let authenticated = this.$cookie.get('locker-room-auth');
      if (authenticated) {
        const username = this.$cookie.get('locker-room-auth');
        this.username = username;
        this.tittle = "Hi " + username + ","
      }
    setTimeout(()=>{this.loading = false}, 1)
  },

  methods: {
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url('../assets/tray.jpg');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  height: 100%;
}

.content-title {
  margin-bottom: 30px;
}

.content-section {
  margin-bottom: 10px;
}

.content-text {
  background-color: rgba(255, 255, 255, 0.89);
  min-width: 50rem;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

h1 {
  font-weight: 600;
  font-size: 50px;
}

h2 {
  font-weight: 600;
}

h3 {
  font-weight: normal;
  font-size: 20px;
}

p {
  margin-left: 20px;
}

.fade-enter-active {
  transition: all 1s ease;
}

.fade-enter,
.fade-leave-active {
  transform: translateX(10px);
  opacity: 0;
}
.fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
</style>