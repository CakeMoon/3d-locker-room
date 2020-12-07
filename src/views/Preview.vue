<template>
  <div class="page">
    <NavBar/>
    <div class="canvas-three">
      <Scene/>
    </div>
  </div>
</template>

<script>
import NavBar from '../components/NavBar';
import Scene from '../components/Scene';

export default {
  name: "Preview",

  components: {
    NavBar,
    Scene
  }
  
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.canvas-three{
  height: 100%;
}
</style>