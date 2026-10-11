import {
  AVV,
  KATEGORIEN,
  PERSONENDATEN,
  STANDORTE,
  TRAINING,
  ZUGAENGE,
} from '../../fach/werkzeug';
import { JA_NEIN_OPTIONEN, optionen } from '../../teile/auswahl/auswahl';
import { OPTIONEN } from '../../texte/de-CH';

/** Die Antwortmöglichkeiten je Auswahlfrage, in der Reihenfolge des Formulars. */
export const AUSWAHL_OPTIONEN = {
  standort: optionen(STANDORTE, OPTIONEN.standort),
  kategorie: optionen(KATEGORIEN, OPTIONEN.kategorie),
  zugang: optionen(ZUGAENGE, OPTIONEN.zugang),
  personendaten: optionen(PERSONENDATEN, OPTIONEN.personendaten),
  training: optionen(TRAINING, OPTIONEN.training),
  avv: optionen(AVV, OPTIONEN.avv),
  jaNein: JA_NEIN_OPTIONEN,
};
