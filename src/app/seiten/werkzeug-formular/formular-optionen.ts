import {
  AVV,
  KATEGORIEN,
  PERSONENDATEN,
  STANDORTE,
  TRAINING,
  ZUGAENGE,
} from '../../fach/werkzeug';
import { JA_NEIN_OPTIONEN, optionen, type Option } from '../../teile/auswahl/auswahl';
import { OPTIONEN, TEXTE } from '../../texte/de-CH';

/**
 * «Weiss ich nicht» lässt die Antwort offen (null) und ist darum gewählt, solange
 * nichts anderes feststeht. Die älteren Antworten «unbekannt» und «unklar» bietet
 * das Formular nicht mehr an; es zeigt sie als «Weiss ich nicht».
 */
export const WEISS_NICHT: Option<null> = { wert: null, text: TEXTE.formular.weissNicht, leise: true };

const ohne = <K extends string>(werte: readonly K[], weg: K) => werte.filter((wert) => wert !== weg);

/** Die Antwortmöglichkeiten je Auswahlfrage, in der Reihenfolge des Formulars. */
export const AUSWAHL_OPTIONEN = {
  standort: [...optionen(ohne(STANDORTE, 'unbekannt'), OPTIONEN.standort), WEISS_NICHT],
  kategorie: optionen(KATEGORIEN, OPTIONEN.kategorie),
  zugang: [...optionen(ZUGAENGE, OPTIONEN.zugang), WEISS_NICHT],
  personendaten: [...optionen(PERSONENDATEN, OPTIONEN.personendaten), WEISS_NICHT],
  training: [...optionen(ohne(TRAINING, 'unbekannt'), OPTIONEN.training), WEISS_NICHT],
  avv: [...optionen(ohne(AVV, 'unklar'), OPTIONEN.avv), WEISS_NICHT],
  jaNein: [...JA_NEIN_OPTIONEN, WEISS_NICHT],
};
