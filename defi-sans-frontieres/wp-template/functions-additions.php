<?php
/**
 * Extensions thème enfant — Défi Sans Frontières (Maroc 2026)
 * À inclure depuis functions.php du thème enfant :
 * require_once get_stylesheet_directory() . '/defi-sans-frontieres/wp-template/functions-additions.php';
 *
 * @package FSO_DefiSansFrontieres
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Chemin absolu vers le dossier livrable `defi-sans-frontieres/` dans le thème enfant */
function dsf_landing_dir() {
	return trailingslashit( get_stylesheet_directory() ) . 'defi-sans-frontieres';
}

/** URL publique du dossier livrable */
function dsf_landing_uri() {
	return trailingslashit( get_stylesheet_directory_uri() ) . 'defi-sans-frontieres';
}

/**
 * Affiche le HTML de la landing (extrait depuis index.html) avec réécriture des chemins `assets/`.
 * Permet de maintenir une seule source (index.html) pour la version statique et WP.
 *
 * @return string
 */
function dsf_render_landing_markup() {
	$path = dsf_landing_dir() . '/index.html';
	if ( ! is_readable( $path ) ) {
		return '<!-- DSF : index.html introuvable dans le thème enfant. -->';
	}

	$html = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$base = untrailingslashit( dsf_landing_uri() );

	$html = str_replace(
		array( 'href="assets/', 'src="assets/' ),
		array( 'href="' . $base . '/assets/', 'src="' . $base . '/assets/' ),
		$html
	);

	$out = '';

	// Bandeau noscript + lien « skip » (accessibilité)
	if ( preg_match( '#<a class="dsf-skip"[^>]*>.*?</a>#si', $html, $sk ) ) {
		$out .= $sk[0];
	}
	if ( preg_match( '#<div class="dsf-noscript">.*?</div>#si', $html, $ns ) ) {
		$out .= $ns[0];
	}

	// Mini-header landing (CTA) — retirer ce bloc si le thème FSO impose sa propre barre
	if ( preg_match( '#<header class="dsf-header"[^>]*>.*?</header>#si', $html, $hd ) ) {
		$out .= $hd[0];
	}

	if ( preg_match( '#<main\\b[^>]*id="contenu-principal"[^>]*>([\\s\\S]*?)</main>#i', $html, $m ) ) {
		$out .= '<main id="contenu-principal">' . $m[1] . '</main>';
	}

	if ( preg_match( '#<footer class="dsf-footer"[^>]*>([\\s\\S]*?)</footer>#i', $html, $f ) ) {
		$out .= '<footer class="dsf-footer">' . $f[1] . '</footer>';
	}

	return $out;
}

/**
 * Enqueue CSS/JS uniquement sur la page slug `defi-sans-frontieres`.
 */
function dsf_enqueue_landing_assets() {
	if ( ! is_page( 'defi-sans-frontieres' ) ) {
		return;
	}

	$dir = dsf_landing_dir();
	$uri = dsf_landing_uri();

	$v_main = is_readable( $dir . '/assets/css/main.css' ) ? (string) filemtime( $dir . '/assets/css/main.css' ) : null;

	wp_enqueue_style( 'dsf-variables', $uri . '/assets/css/variables.css', array(), $v_main );
	wp_enqueue_style( 'dsf-main', $uri . '/assets/css/main.css', array( 'dsf-variables' ), $v_main );

	$handles = array(
		'dsf-analytics'   => '/assets/js/analytics.js',
		'dsf-smooth'     => '/assets/js/smooth-scroll.js',
		'dsf-design-motion' => '/assets/js/design-motion.js',
		'dsf-form-gate'  => '/assets/js/form-gate.js',
		'dsf-form-progress' => '/assets/js/form-progress.js',
		'dsf-form-submit' => '/assets/js/form-submit.js',
	);

	foreach ( $handles as $handle => $rel ) {
		$file = $dir . $rel;
		$ver  = is_readable( $file ) ? (string) filemtime( $file ) : $v_main;
		wp_enqueue_script( $handle, $uri . $rel, array(), $ver, true );
	}

	// TODO FSO : passer les IDs via wp_localize_script au lieu de les coder en dur dans analytics.js
	wp_localize_script(
		'dsf-analytics',
		'dsfConfig',
		array(
			'pageSlug' => 'defi-sans-frontieres',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'dsf_enqueue_landing_assets', 20 );

/**
 * Classe body pour appliquer les styles `.dsf-landing` sous WordPress.
 *
 * @param array $classes Classes existantes.
 * @return array
 */
function dsf_body_class( $classes ) {
	if ( is_page( 'defi-sans-frontieres' ) ) {
		$classes[] = 'dsf-landing';
	}
	return $classes;
}
add_filter( 'body_class', 'dsf_body_class' );

/**
 * Ajoute defer aux scripts DSF.
 *
 * @param string $tag    Balise script.
 * @param string $handle Handle WordPress.
 * @return string
 */
function dsf_defer_scripts( $tag, $handle ) {
	$dsf_handles = array( 'dsf-analytics', 'dsf-smooth', 'dsf-design-motion', 'dsf-form-gate', 'dsf-form-progress', 'dsf-form-submit' );
	if ( in_array( $handle, $dsf_handles, true ) && false === strpos( $tag, 'defer' ) ) {
		return str_replace( ' src', ' defer src', $tag );
	}
	return $tag;
}
add_filter( 'script_loader_tag', 'dsf_defer_scripts', 10, 2 );

/**
 * Shortcode minimal : CTA vers #filtres (injection dans une page existante).
 *
 * @return string
 */
function dsf_shortcode_hero_cta() {
	return '<p><a class="dsf-btn dsf-btn--primary" href="#filtres">Je postule</a></p>';
}
add_shortcode( 'dsf_hero_cta', 'dsf_shortcode_hero_cta' );

/**
 * Shortcode admin / debug : rappel de configuration.
 */
function dsf_shortcode_assets_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return '';
	}
	return '<p class="notice notice-info"><strong>Défi Sans Frontières</strong> : vérifie que le dossier <code>defi-sans-frontieres/</code> est présent dans le thème enfant et que la page a le bon slug.</p>';
}
add_shortcode( 'dsf_assets_notice', 'dsf_shortcode_assets_notice' );
