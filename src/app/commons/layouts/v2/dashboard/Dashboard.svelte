<div class="container">
	<aside>
		<slot name="menu"/>
	</aside>
	<main>
		<slot/>
	</main>
</div>

<style lang="scss">
  $dashboard-aside-size: 261px;

  .container {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    display: flex;
    justify-content: flex-start;

    & main {
      flex: 1;

      background-color: purple
    }

    & aside {
      width: $dashboard-aside-size;
      height: 100%;

      display: flex;
      justify-content: center;
      flex-direction: row;
      flex-wrap: wrap;

      background-color: greenyellow;

      & :global(> *) {
        flex: 1;
        min-width: $dashboard-aside-size;
        background-color: green;
      }
    }
  }

  @media screen and (max-width: 740px) {
    .container {
      flex-direction: column-reverse;

      & aside {
        height: $dashboard-aside-size;
        width: 100%;
      }
    }
  }
</style>
