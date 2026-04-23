<?php
/**
 * Gabarit de page — Défi Sans Frontières (intégration header/footer FSO)
 *
 * INSTALLATION :
 * 1. Copie ce fichier à la RACINE du thème enfant sous le nom `page-defi-sans-frontieres.php`
 *    (WordPress l’appliquera automatiquement à la page dont le permalien est `defi-sans-frontieres`).
 * 2. Copie le dossier `defi-sans-frontieres/` complet dans le thème enfant.
 * 3. Inclue `functions-additions.php` depuis `functions.php`.
 *
 * OPTION STANDALONE (sans header/footer FSO) :
 * - Duplique ce fichier, retire `get_header()` / `get_footer()` et entoure le markup d’un document HTML minimal
 *   (rare — à valider avec la direction web pour la cohérence de marque).
 *
 * @package FSO_DefiSansFrontieres
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<!-- Début landing DSF — styles/scripts enqueued via functions-additions.php -->
<div class="dsf-wp-wrapper">
	<?php
	if ( function_exists( 'dsf_render_landing_markup' ) ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML contrôlé livré par le repo FSO
		echo dsf_render_landing_markup();
	} else {
		echo '<!-- DSF : inclure functions-additions.php dans functions.php du thème enfant. -->';
	}
	?>
</div>
<!-- Fin landing DSF -->

<?php
get_footer();
