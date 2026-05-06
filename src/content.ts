import type { PlasmoCSConfig } from "plasmo"

import "~assets/pagenote-5.4.7/pagenote.js"
import "./vendor/react.production.min"
import "./vendor/react-dom.production.min"

import { mountFeynmanNotes } from "./content-script"

export const config: PlasmoCSConfig = {
  css: [
    "../assets/pagenote-5.4.7/pagenote.css",
    "./feynman.css",
  ],
  matches: ["https://*/*", "http://*/*"],
  run_at: "document_end"
}

mountFeynmanNotes()
