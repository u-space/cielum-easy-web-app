<dialog open>
    <slot/>
</dialog>

<style lang="scss">
  @import './mixins.scss';

  dialog {
    position: relative;
    top: 0;
    right: 0;
    width: 300px;
    max-height: 300px;
    margin: 0;
    @include box-shadow-1;
    @include no-outline;

    border-radius: var(--c-radius-s);

    padding: var(--padding-xs);

    background-color: var(--primary-700);
  }
</style>
