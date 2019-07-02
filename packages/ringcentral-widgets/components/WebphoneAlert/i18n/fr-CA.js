import webphoneErrors from 'ringcentral-integration/modules/Webphone/webphoneErrors';
export default {
  [webphoneErrors.connected]: "Téléphone Web inscrit.",
  [webphoneErrors.webphoneCountOverLimit]: "Cinq téléphones Web au maximum peuvent être enregistrés.",
  [webphoneErrors.noOutboundCallWithoutDL]: "Votre poste n'est pas autorisé à faire des appels sortants avec le navigateur pour le moment. Veuillez communiquer avec votre représentant de compte pour obtenir une mise à niveau.",
  [webphoneErrors.toVoiceMailError]: "Impossible d'acheminer l'appel vers la messagerie vocale en raison d'une erreur interne",
  [webphoneErrors.muteError]: "L'appel ne peut être mis en mode discrétion pour le moment.",
  [webphoneErrors.holdError]: "L'appel ne peut être mis en attente pour le moment.",
  [webphoneErrors.flipError]: "Impossible de renvoyer l'appel. Veuillez réessayer plus tard.",
  [webphoneErrors.recordError]: "Vous ne pouvez pas enregistrer l'appel pour le moment. Code d'erreur : {errorCode}",
  [webphoneErrors.recordDisabled]: "Désolé, votre compte ne possède pas la fonction d'enregistrement d'appel. Veuillez communiquer avec votre administrateur de compte.",
  [webphoneErrors.transferError]: "Impossible de transférer l'appel. Veuillez réessayer plus tard.",
};

// @key: @#@"[webphoneErrors.connected]"@#@ @source: @#@"Web phone registered."@#@
// @key: @#@"[webphoneErrors.browserNotSupported]"@#@ @source: @#@"Calling with browser is only supported on Chrome."@#@
// @key: @#@"[webphoneErrors.webphoneCountOverLimit]"@#@ @source: @#@"A maximum of 5 web phones could be registered."@#@
// @key: @#@"[webphoneErrors.noOutboundCallWithoutDL]"@#@ @source: @#@"Your extension is not allowed to make outbound calls with browser currently, please contact your account representative for an upgrade."@#@
// @key: @#@"[webphoneErrors.toVoiceMailError]"@#@ @source: @#@"Cannot send call to voicemail due to internal error"@#@
// @key: @#@"[webphoneErrors.muteError]"@#@ @source: @#@"Call cannot be muted at the moment."@#@
// @key: @#@"[webphoneErrors.holdError]"@#@ @source: @#@"Call cannot be hold at the moment."@#@
// @key: @#@"[webphoneErrors.flipError]"@#@ @source: @#@"Cannot flip the call. Please try again later."@#@
// @key: @#@"[webphoneErrors.recordError]"@#@ @source: @#@"You cannot record the call at the moment. Error code: {errorCode}"@#@
// @key: @#@"[webphoneErrors.recordDisabled]"@#@ @source: @#@"Sorry, your account does not have the feature to record a call. Please contact your account administrator."@#@
// @key: @#@"[webphoneErrors.transferError]"@#@ @source: @#@"Cannot transfer the call. Please try again later."@#@
