<template>
    <b-container class="games-container">
        <b-row class="games-grid">
            <b-col cols="6">
                <div class="game" :style='{ backgroundImage: "url(" + gamesBackgrounds("./doubleup_bg.png") + ")" }'>
                    <h1>Double Up!</h1>
                    <a href="/#/DoubleUp" target="_blank"></a>
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
  // Get all images from 'games' directory
  const gamesBackgrounds = require.context('../assets/games', true, /\.(png|jpe?g|gif|svg)(\?.*)?$/);
  // const imagesDataMap = imagesData.keys().map(imagesData);

  export default {
    name: 'Games',
    data() {
      return {
        debug: true,
        gamesBackgrounds
      };
    }
  };
</script>

<style scoped lang="sass">
    .games-container
        margin-top: 50px
    .game
        position: relative
        display: flex
        justify-content: center
        align-items: center
        min-height: 400px
        border-radius: 25px
        cursor: pointer
        transition: all 0.2s
        background-size: 100% 100%
        background-position: center center
        background-repeat: no-repeat
        filter: grayscale(75%)
        a
            display: flex
            position: absolute
            width: 100%
            height: 100%
            top: 0
            left: 0
        h1
            transition: all 0.2s
            color: #FFF
            text-shadow: 4px 4px 2px rgba(150, 150, 150, 1)
        &:hover
            background-size: 103% 103%
            filter: grayscale(0%)
            h1
                font-size: 3rem
                text-shadow: 4px 4px 2px rgba(0, 0, 0, 1)

</style>
