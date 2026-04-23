<?php
/**
 * Variante Gravity Forms — même rendu que `page-defi-sans-frontieres.php` pour l’instant.
 *
 * IMPORTANT — avant prod avec Gravity :
 * - Évite deux formulaires : retire le bloc `<form id="dsf-candidature-form">...</form>` de `index.html`
 *   (ou crée une copie `index-gravity.html` et adapte `dsf_render_landing_markup()` pour pointer vers ce fichier).
 * - Insère `gravity_form( ID, ... )` à l’endroit voulu dans le HTML (souvent à la place de la section #postuler),
 *   ou colle le shortcode `[gravityform id="X"]` dans le contenu éditeur et supprime la section formulaire du HTML statique.
 *
 * INSTALLATION : copie à la racine du thème enfant si tu utilises le « Template Name » dans l’éditeur de page.
 *
 * @package FSO_DefiSansFrontieres
 */

/*
 * Template Name: Défi Sans Frontières — Gravity (copie de base)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<div class="dsf-wp-wrapper">
	<?php
	if ( function_exists( 'dsf_render_landing_markup' ) ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo dsf_render_landing_markup();
	} else {
		echo '<!-- DSF : inclure functions-additions.php dans functions.php du thème enfant. -->';
	}
	?>
</div>

<?php
get_footer();
