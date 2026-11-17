/**
 * @file
 * NAME component behavior. Delete this file if the component has no JS.
 */

((Drupal, once) => {
  Drupal.behaviors.projectNAME = {
    attach(context) {
      once('project-NAME', context.querySelectorAll('.c-NAME')).forEach(() => {
        // Initialize the component.
      });
    },
  };
})(Drupal, once);
