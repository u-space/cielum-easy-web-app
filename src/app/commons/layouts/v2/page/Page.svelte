<div class="page">
	<header>
		<slot name="header"/>
	</header>
	<div class="content">
		<slot/>
	</div>
	<footer>
		<slot name="footer"/>
	</footer>
</div>

<style lang="scss">
  $max-width: 800px;

  .page {
    flex: 1;
    max-width: $max-width;

    position: relative;

    display: flex;
    flex-direction: column;
    margin: var(--spacing-2) auto;

    font-size: 1rem;
    border-radius: var(--radius-l);
    color: var(--mirai-900);
    background-color: var(--mirai-100);

    & header, & footer {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      color: var(--white-100);
      background-color: var(--primary-600);
      font-size: 1.5em;

      height: 2em;
    }

    & .content {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
	
  }

  @media (max-width: 850px) {
    .page {
      max-width: 100%;
      margin: 0;
      border-radius: 0;
    }
  }
</style>
