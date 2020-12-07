<template>
<div>
  <b-card no-body class="overflow-hidden" style="max-width: 540px;">
    <b-row no-gutters>
        <b-card-body v-bind:title="model3D.name">
          <b-button @click="deleteModel" align-self="end" block variant="outline-secondary">Delete</b-button>
        </b-card-body>
    </b-row>
  </b-card>
</div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "ModelCard",

  components: {
  },

  props: ["model3D"],

  data() {
    return {
      username: "",
    }
  }, 

  methods: {
    deleteModel: function() {
      axios.delete('/api/model3ds/' + this.model3D.id)
        .then((res) => {
          // handle success
          eventBus.$emit('delete-model-success', res);
        }).catch((err) => {
          eventBus.$emit('delete-model-error', err);
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