import type { PlasmoCSConfig } from "plasmo"

import "~chrome/economistCom-unlocked/main.js"
import "~chrome/pagenote-5.4.7/pagenote.js"
import "./vendor/react.production.min"
import "./vendor/react-dom.production.min"

import { mountFeynmanNotes } from "./content-script"

export const config: PlasmoCSConfig = {
  css: [
    "../chrome/pagenote-5.4.7/pagenote.css",
    "./feynman-book.css",
    "./feynman.css",
    "../chrome/economistCom-unlocked/extenCard.css"
  ],
  matches: ["https://*/*", "http://*/*"],
  run_at: "document_end"
}

mountFeynmanNotes()
