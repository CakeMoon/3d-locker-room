<template>
<div>
  <b-card no-body class="overflow-hidden" style="max-width: 540px;">
    <b-row no-gutters>
      <b-col md="6">
        <b-card-img width=200 v-bind:src="image.link" alt="Image"></b-card-img>
      </b-col>
      <b-col md="6">
        <b-card-body v-bind:title="image.name">
          <b-button @click="deleteImage" align-self="end" block variant="outline-secondary">Delete</b-button>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "ImageCard",

  components: {
  },

  props: ["image"],

  data() {
    return {
      username: "",
    }
  }, 

  methods: {
    deleteImage: function() {
      axios.delete('/api/images/' + this.image.id)
        .then((res) => {
          // handle success
          eventBus.$emit('delete-image-success', res);
        }).catch((err) => {
          eventBus.$emit('delete-image-error', err);
        });
    }
  }
}
</script>

<style scoped>
.card {
  margin: 10px;
  border: 1px solid;
  width: 450px;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
</style>