{
  "patcher": {
    "fileversion": 1,
    "appversion": {
      "major": 9,
      "minor": 1,
      "revision": 4,
      "architecture": "arm64",
      "modernui": 1
    },
    "classnamespace": "box",
    "rect": [
      60,
      80,
      1180,
      830
    ],
    "openinpresentation": 1,
    "default_fontsize": 12,
    "default_fontname": "Arial",
    "bgcolor": [
      0.025,
      0.036,
      0.06,
      1
    ],
    "boxes": [
      {
        "box": {
          "id": "grid",
          "maxclass": "v8ui",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            320,
            190,
            448,
            448
          ],
          "filename": "lens_grid.js",
          "varname": "grid",
          "presentation": 1,
          "presentation_rect": [
            320,
            190,
            448,
            448
          ],
          "textfile": {
            "filename": "lens_grid.js",
            "flags": 0,
            "embed": 0,
            "autowatch": 1
          }
        }
      },
      {
        "box": {
          "id": "ui",
          "maxclass": "v8ui",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            10,
            10,
            1180,
            830
          ],
          "filename": "lens_screen.js",
          "varname": "ui",
          "background": 1,
          "presentation": 1,
          "presentation_rect": [
            0,
            0,
            1180,
            830
          ],
          "textfile": {
            "filename": "lens_screen.js",
            "flags": 0,
            "embed": 0,
            "autowatch": 1
          }
        }
      },
      {
        "box": {
          "id": "controller",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            20,
            880,
            220,
            22
          ],
          "varname": "controller",
          "text": "v8 lens_runtime.js"
        }
      },
      {
        "box": {
          "id": "ui-defer",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            850,
            100,
            22
          ],
          "text": "deferlow"
        }
      },
      {
        "box": {
          "id": "lb",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            930,
            90,
            22
          ],
          "text": "loadbang"
        }
      },
      {
        "box": {
          "id": "delay",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            970,
            100,
            22
          ],
          "text": "delay 350"
        }
      },
      {
        "box": {
          "id": "init",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1010,
            80,
            22
          ],
          "text": "init"
        }
      },
      {
        "box": {
          "id": "control",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            260,
            890,
            170,
            22
          ],
          "text": "r lunar-lens-control"
        }
      },
      {
        "box": {
          "id": "drop",
          "maxclass": "dropfile",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            260,
            945,
            264,
            22
          ],
          "presentation": 1,
          "presentation_rect": [
            28,
            210,
            264,
            40
          ],
          "bgcolor": [
            0,
            0,
            0,
            0
          ],
          "bordercolor": [
            0.15,
            0.21,
            0.3,
            1
          ]
        }
      },
      {
        "box": {
          "id": "file-dialog",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            260,
            1000,
            120,
            22
          ],
          "varname": "file-dialog",
          "text": "opendialog"
        }
      },
      {
        "box": {
          "id": "loadtag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            260,
            1050,
            150,
            22
          ],
          "text": "prepend loadfile"
        }
      },
      {
        "box": {
          "id": "player",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 4,
          "patching_rect": [
            20,
            1130,
            230,
            22
          ],
          "varname": "player",
          "text": "sfplay~ 2 0 1"
        }
      },
      {
        "box": {
          "id": "info",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 6,
          "patching_rect": [
            280,
            1130,
            180,
            22
          ],
          "varname": "info",
          "text": "sfinfo~"
        }
      },
      {
        "box": {
          "id": "info0",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            280,
            1180,
            145,
            22
          ],
          "text": "prepend filechannels"
        }
      },
      {
        "box": {
          "id": "info2",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            580,
            1180,
            145,
            22
          ],
          "text": "prepend filerate"
        }
      },
      {
        "box": {
          "id": "info3",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            730,
            1180,
            145,
            22
          ],
          "text": "prepend fileduration"
        }
      },
      {
        "box": {
          "id": "pos",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1190,
            125,
            22
          ],
          "varname": "position-probe",
          "text": "snapshot~ 100"
        }
      },
      {
        "box": {
          "id": "postag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1230,
            170,
            22
          ],
          "text": "prepend fileposition"
        }
      },
      {
        "box": {
          "id": "capture-pos",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1255,
            125,
            22
          ],
          "varname": "capture-position",
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "capture-pos-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            160,
            1255,
            195,
            22
          ],
          "text": "prepend frameposition"
        }
      },
      {
        "box": {
          "id": "ended",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            170,
            1230,
            100,
            22
          ],
          "text": "fileended"
        }
      },
      {
        "box": {
          "id": "adc",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            550,
            1270,
            120,
            22
          ],
          "text": "adc~ 1 2"
        }
      },
      {
        "box": {
          "id": "file-gain",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            20,
            1290,
            100,
            22
          ],
          "varname": "file-gain",
          "text": "line~ 1."
        }
      },
      {
        "box": {
          "id": "live-gain",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            550,
            1320,
            100,
            22
          ],
          "varname": "live-gain",
          "text": "line~ 0."
        }
      },
      {
        "box": {
          "id": "mono",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            320,
            1290,
            100,
            22
          ],
          "varname": "mono",
          "text": "line~ 0."
        }
      },
      {
        "box": {
          "id": "mono-copy",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            320,
            1350,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "analysis",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 24,
          "patching_rect": [
            20,
            1520,
            440,
            22
          ],
          "varname": "analysis",
          "text": "gen~ lens_analysis"
        }
      },
      {
        "box": {
          "id": "fx",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            550,
            1520,
            230,
            22
          ],
          "varname": "fx",
          "text": "gen~ lens_fx"
        }
      },
      {
        "box": {
          "id": "file0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1400,
            65,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "live0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            550,
            1400,
            65,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "file1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            250,
            1400,
            65,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "live1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            780,
            1400,
            65,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "poll",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1610,
            100,
            22
          ],
          "varname": "poll",
          "text": "qmetro 20"
        }
      },
      {
        "box": {
          "id": "trig",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 24,
          "patching_rect": [
            20,
            1650,
            1020,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "pack",
          "maxclass": "newobj",
          "numinlets": 24,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1780,
            1020,
            22
          ],
          "text": "pack f f f f f f f f f f f f f f f f f f f f f f f f"
        }
      },
      {
        "box": {
          "id": "featuretag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1820,
            160,
            22
          ],
          "text": "prepend features"
        }
      },
      {
        "box": {
          "id": "snap0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            108,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap2",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            196,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap3",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            284,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap4",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            372,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap5",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            460,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap6",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            548,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap7",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            636,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap8",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            724,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap9",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            812,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap10",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            900,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap11",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            988,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap12",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1076,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap13",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1164,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap14",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1252,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap15",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1340,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap16",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1428,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap17",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1516,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap18",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1604,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap19",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1692,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap20",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1780,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap21",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1868,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap22",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1956,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap23",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            2044,
            1720,
            80,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "context",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 5,
          "patching_rect": [
            1180,
            1520,
            240,
            22
          ],
          "varname": "context",
          "text": "gen~ lens_context"
        }
      },
      {
        "box": {
          "id": "spectral",
          "maxclass": "newobj",
          "numinlets": 3,
          "numoutlets": 1,
          "patching_rect": [
            1470,
            1520,
            250,
            22
          ],
          "varname": "spectral",
          "text": "pfft~ lens_spectral 2048 4"
        }
      },
      {
        "box": {
          "id": "context-trigger",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 5,
          "patching_rect": [
            1180,
            1610,
            180,
            22
          ],
          "text": "t b b b b b"
        }
      },
      {
        "box": {
          "id": "context-pack",
          "maxclass": "newobj",
          "numinlets": 5,
          "numoutlets": 1,
          "patching_rect": [
            1180,
            1780,
            190,
            22
          ],
          "text": "pack f f f f f"
        }
      },
      {
        "box": {
          "id": "context-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            1180,
            1820,
            190,
            22
          ],
          "text": "prepend contextual"
        }
      },
      {
        "box": {
          "id": "context-snap0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1180,
            1720,
            95,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "context-snap1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1280,
            1720,
            95,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "context-snap2",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1380,
            1720,
            95,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "context-snap3",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1480,
            1720,
            95,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "context-snap4",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            1580,
            1720,
            95,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "spectral-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            1470,
            1580,
            180,
            22
          ],
          "text": "prepend spectral"
        }
      },
      {
        "box": {
          "id": "dsp-state",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 6,
          "patching_rect": [
            1740,
            1520,
            130,
            22
          ],
          "text": "dspstate~"
        }
      },
      {
        "box": {
          "id": "sr-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            1740,
            1580,
            160,
            22
          ],
          "text": "prepend audiorate"
        }
      },
      {
        "box": {
          "id": "spectral-rate",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            1740,
            1620,
            160,
            22
          ],
          "text": "prepend hostRate"
        }
      },
      {
        "box": {
          "id": "vst",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 8,
          "patching_rect": [
            550,
            1870,
            240,
            22
          ],
          "varname": "vst",
          "text": "vst~ 2 2 @autosave 0"
        }
      },
      {
        "box": {
          "id": "plugin-dry",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            400,
            1930,
            100,
            22
          ],
          "varname": "plugin-dry",
          "text": "line~ 1."
        }
      },
      {
        "box": {
          "id": "plugin-wet",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            750,
            1930,
            100,
            22
          ],
          "varname": "plugin-wet",
          "text": "line~ 0."
        }
      },
      {
        "box": {
          "id": "vsttag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            850,
            1870,
            170,
            22
          ],
          "text": "prepend plugininfo"
        }
      },
      {
        "box": {
          "id": "master",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            700,
            2050,
            120,
            22
          ],
          "varname": "master",
          "text": "line~ 0.4"
        }
      },
      {
        "box": {
          "id": "monitor",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 2,
          "patching_rect": [
            950,
            2120,
            100,
            22
          ],
          "varname": "monitor",
          "text": "line~ 0."
        }
      },
      {
        "box": {
          "id": "dac",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 0,
          "patching_rect": [
            940,
            2290,
            150,
            22
          ],
          "varname": "dsp",
          "text": "dac~ 1 2"
        }
      },
      {
        "box": {
          "id": "recorder",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            570,
            2290,
            220,
            22
          ],
          "varname": "recorder",
          "text": "sfrecord~ 2"
        }
      },
      {
        "box": {
          "id": "dry0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            400,
            1980,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "wet0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            1980,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "mg0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            400,
            2070,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "guard0",
          "maxclass": "newobj",
          "numinlets": 3,
          "numoutlets": 1,
          "patching_rect": [
            400,
            2120,
            150,
            22
          ],
          "text": "clip~ -0.98 0.98"
        }
      },
      {
        "box": {
          "id": "mon0",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            400,
            2180,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "dry1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            780,
            1980,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "wet1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            880,
            1980,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "mg1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            780,
            2070,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "guard1",
          "maxclass": "newobj",
          "numinlets": 3,
          "numoutlets": 1,
          "patching_rect": [
            780,
            2120,
            150,
            22
          ],
          "text": "clip~ -0.98 0.98"
        }
      },
      {
        "box": {
          "id": "mon1",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            780,
            2180,
            70,
            22
          ],
          "text": "*~"
        }
      },
      {
        "box": {
          "id": "peak",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            220,
            2170,
            130,
            22
          ],
          "text": "peakamp~ 100"
        }
      },
      {
        "box": {
          "id": "peak-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            220,
            2210,
            180,
            22
          ],
          "text": "prepend metervalue"
        }
      },
      {
        "box": {
          "id": "record-dialog",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            300,
            2280,
            160,
            22
          ],
          "varname": "record-dialog",
          "text": "savedialog WAVE"
        }
      },
      {
        "box": {
          "id": "record-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            300,
            2320,
            170,
            22
          ],
          "text": "prepend recordfile"
        }
      },
      {
        "box": {
          "id": "dsp-dialog",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            2320,
            150,
            22
          ],
          "varname": "dsp-dialog",
          "text": "; max dspstatus"
        }
      },
      {
        "box": {
          "id": "ports-refresh",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            20,
            2410,
            140,
            22
          ],
          "varname": "ports-refresh",
          "text": "t b b"
        }
      },
      {
        "box": {
          "id": "input-menu",
          "maxclass": "umenu",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            20,
            2480,
            295,
            22
          ],
          "items": [
            "none"
          ],
          "varname": "input-menu",
          "presentation": 1,
          "presentation_rect": [
            28,
            743,
            292,
            25
          ]
        }
      },
      {
        "box": {
          "id": "input-info",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            2440,
            160,
            22
          ],
          "text": "midiinfo"
        }
      },
      {
        "box": {
          "id": "inminus",
          "maxclass": "message",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            170,
            2410,
            40,
            22
          ],
          "text": "-1"
        }
      },
      {
        "box": {
          "id": "input-seen",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            2530,
            230,
            22
          ],
          "text": "prepend portseen input"
        }
      },
      {
        "box": {
          "id": "input-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            20,
            2570,
            230,
            22
          ],
          "text": "prepend port input"
        }
      },
      {
        "box": {
          "id": "output-menu",
          "maxclass": "umenu",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            370,
            2480,
            295,
            22
          ],
          "items": [
            "none"
          ],
          "varname": "output-menu",
          "presentation": 1,
          "presentation_rect": [
            335,
            743,
            292,
            25
          ]
        }
      },
      {
        "box": {
          "id": "output-info",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            370,
            2440,
            160,
            22
          ],
          "text": "midiinfo"
        }
      },
      {
        "box": {
          "id": "output-seen",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            370,
            2530,
            230,
            22
          ],
          "text": "prepend portseen output"
        }
      },
      {
        "box": {
          "id": "output-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            370,
            2570,
            230,
            22
          ],
          "text": "prepend port output"
        }
      },
      {
        "box": {
          "id": "midi-in",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            740,
            2410,
            160,
            22
          ],
          "varname": "midi-in",
          "text": "midiin none"
        }
      },
      {
        "box": {
          "id": "midi-tag",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            740,
            2470,
            180,
            22
          ],
          "text": "prepend midibyte"
        }
      },
      {
        "box": {
          "id": "lp-out",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            970,
            2410,
            160,
            22
          ],
          "varname": "lp-out",
          "text": "midiout none"
        }
      },
      {
        "box": {
          "id": "fx-panel",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            800,
            2550,
            220,
            22
          ],
          "varname": "fx-panel",
          "patcher": {
            "fileversion": 1,
            "appversion": {
              "major": 9,
              "minor": 1,
              "revision": 4,
              "architecture": "arm64",
              "modernui": 1
            },
            "classnamespace": "box",
            "rect": [
              100,
              100,
              740,
              410
            ],
            "openinpresentation": 0,
            "default_fontsize": 12,
            "default_fontname": "Arial",
            "bgcolor": [
              0.12,
              0.15,
              0.2,
              1
            ],
            "boxes": [
              {
                "box": {
                  "id": "title",
                  "maxclass": "comment",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "patching_rect": [
                    25,
                    20,
                    680,
                    22
                  ],
                  "textcolor": [
                    0.9,
                    0.94,
                    1,
                    1
                  ],
                  "fontsize": 16,
                  "text": "音訊效果器 / VST3 / AU · 原曲分析始終在效果器之前"
                }
              },
              {
                "box": {
                  "id": "in",
                  "maxclass": "inlet",
                  "numinlets": 0,
                  "numoutlets": 1,
                  "patching_rect": [
                    630,
                    320,
                    30,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "this",
                  "maxclass": "newobj",
                  "numinlets": 1,
                  "numoutlets": 1,
                  "patching_rect": [
                    600,
                    360,
                    110,
                    22
                  ],
                  "text": "thispatcher"
                }
              },
              {
                "box": {
                  "id": "out",
                  "maxclass": "outlet",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "patching_rect": [
                    530,
                    350,
                    30,
                    22
                  ]
                }
              },
              {
                "box": {
                  "id": "b0",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    25,
                    75,
                    185,
                    22
                  ],
                  "text": "選擇效果器"
                }
              },
              {
                "box": {
                  "id": "cmd0",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    25,
                    105,
                    185,
                    22
                  ],
                  "text": "pluginload"
                }
              },
              {
                "box": {
                  "id": "b1",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    235,
                    75,
                    185,
                    22
                  ],
                  "text": "插件介面"
                }
              },
              {
                "box": {
                  "id": "cmd1",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    235,
                    105,
                    185,
                    22
                  ],
                  "text": "plugineditor"
                }
              },
              {
                "box": {
                  "id": "b2",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    445,
                    75,
                    185,
                    22
                  ],
                  "text": "啟用"
                }
              },
              {
                "box": {
                  "id": "cmd2",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    445,
                    105,
                    185,
                    22
                  ],
                  "text": "param plugin 1"
                }
              },
              {
                "box": {
                  "id": "b3",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    25,
                    145,
                    185,
                    22
                  ],
                  "text": "BYPASS"
                }
              },
              {
                "box": {
                  "id": "cmd3",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    25,
                    175,
                    185,
                    22
                  ],
                  "text": "param plugin 0"
                }
              },
              {
                "box": {
                  "id": "b4",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    235,
                    145,
                    185,
                    22
                  ],
                  "text": "讀取 PRESET"
                }
              },
              {
                "box": {
                  "id": "cmd4",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    235,
                    175,
                    185,
                    22
                  ],
                  "text": "pluginread"
                }
              },
              {
                "box": {
                  "id": "b5",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    445,
                    145,
                    185,
                    22
                  ],
                  "text": "儲存 PRESET"
                }
              },
              {
                "box": {
                  "id": "cmd5",
                  "maxclass": "message",
                  "numinlets": 2,
                  "numoutlets": 1,
                  "patching_rect": [
                    445,
                    175,
                    185,
                    22
                  ],
                  "text": "pluginwrite"
                }
              },
              {
                "box": {
                  "id": "hint",
                  "maxclass": "comment",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "patching_rect": [
                    25,
                    235,
                    690,
                    22
                  ],
                  "textcolor": [
                    0.85,
                    0.9,
                    0.98,
                    1
                  ],
                  "text": "插件介面內可調整參數與 preset。AU preset 建議由插件自身介面管理。"
                }
              },
              {
                "box": {
                  "id": "hint2",
                  "maxclass": "comment",
                  "numinlets": 1,
                  "numoutlets": 0,
                  "patching_rect": [
                    25,
                    267,
                    690,
                    22
                  ],
                  "textcolor": [
                    0.85,
                    0.9,
                    0.98,
                    1
                  ],
                  "text": "插件可能引入延遲；視覺分析保持原始音訊時間。預設 BYPASS。"
                }
              }
            ],
            "lines": [
              {
                "patchline": {
                  "source": [
                    "in",
                    0
                  ],
                  "destination": [
                    "this",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b0",
                    0
                  ],
                  "destination": [
                    "cmd0",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd0",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b1",
                    0
                  ],
                  "destination": [
                    "cmd1",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd1",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b2",
                    0
                  ],
                  "destination": [
                    "cmd2",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd2",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b3",
                    0
                  ],
                  "destination": [
                    "cmd3",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd3",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b4",
                    0
                  ],
                  "destination": [
                    "cmd4",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd4",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "b5",
                    0
                  ],
                  "destination": [
                    "cmd5",
                    0
                  ]
                }
              },
              {
                "patchline": {
                  "source": [
                    "cmd5",
                    0
                  ],
                  "destination": [
                    "out",
                    0
                  ]
                }
              }
            ],
            "autosave": 0
          },
          "text": "p plugin-effects"
        }
      },
      {
        "box": {
          "id": "plugin-dialog",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            1030,
            2510,
            120,
            22
          ],
          "varname": "plugin-dialog",
          "text": "opendialog"
        }
      },
      {
        "box": {
          "id": "plugin-path",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 1,
          "patching_rect": [
            1030,
            2560,
            160,
            22
          ],
          "text": "prepend pluginfile"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "ui",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "controller",
            0
          ],
          "destination": [
            "ui-defer",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ui-defer",
            0
          ],
          "destination": [
            "ui",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "controller",
            2
          ],
          "destination": [
            "grid",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "grid",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "lb",
            0
          ],
          "destination": [
            "delay",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "delay",
            0
          ],
          "destination": [
            "init",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "init",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "control",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "drop",
            0
          ],
          "destination": [
            "loadtag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file-dialog",
            0
          ],
          "destination": [
            "loadtag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "loadtag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info",
            0
          ],
          "destination": [
            "info0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info0",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info",
            2
          ],
          "destination": [
            "info2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info2",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info",
            3
          ],
          "destination": [
            "info3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "info3",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            2
          ],
          "destination": [
            "pos",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pos",
            0
          ],
          "destination": [
            "postag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "postag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            2
          ],
          "destination": [
            "capture-pos",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "capture-pos",
            0
          ],
          "destination": [
            "capture-pos-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "capture-pos-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            3
          ],
          "destination": [
            "ended",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ended",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            0
          ],
          "destination": [
            "mono-copy",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mono",
            0
          ],
          "destination": [
            "mono-copy",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            0
          ],
          "destination": [
            "file0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file-gain",
            0
          ],
          "destination": [
            "file0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "adc",
            0
          ],
          "destination": [
            "live0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live-gain",
            0
          ],
          "destination": [
            "live0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file0",
            0
          ],
          "destination": [
            "analysis",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file0",
            0
          ],
          "destination": [
            "fx",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live0",
            0
          ],
          "destination": [
            "analysis",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live0",
            0
          ],
          "destination": [
            "fx",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "player",
            1
          ],
          "destination": [
            "file1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file-gain",
            0
          ],
          "destination": [
            "file1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mono-copy",
            0
          ],
          "destination": [
            "file1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "adc",
            1
          ],
          "destination": [
            "live1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live-gain",
            0
          ],
          "destination": [
            "live1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file1",
            0
          ],
          "destination": [
            "analysis",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file1",
            0
          ],
          "destination": [
            "fx",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live1",
            0
          ],
          "destination": [
            "analysis",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live1",
            0
          ],
          "destination": [
            "fx",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "poll",
            0
          ],
          "destination": [
            "trig",
            0
          ],
          "order": 2
        }
      },
      {
        "patchline": {
          "source": [
            "pack",
            0
          ],
          "destination": [
            "featuretag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "featuretag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            0
          ],
          "destination": [
            "snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            0
          ],
          "destination": [
            "snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap0",
            0
          ],
          "destination": [
            "pack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            1
          ],
          "destination": [
            "snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            1
          ],
          "destination": [
            "snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap1",
            0
          ],
          "destination": [
            "pack",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            2
          ],
          "destination": [
            "snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            2
          ],
          "destination": [
            "snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap2",
            0
          ],
          "destination": [
            "pack",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            3
          ],
          "destination": [
            "snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            3
          ],
          "destination": [
            "snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap3",
            0
          ],
          "destination": [
            "pack",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            4
          ],
          "destination": [
            "snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            4
          ],
          "destination": [
            "snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap4",
            0
          ],
          "destination": [
            "pack",
            4
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            5
          ],
          "destination": [
            "snap5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            5
          ],
          "destination": [
            "snap5",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap5",
            0
          ],
          "destination": [
            "pack",
            5
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            6
          ],
          "destination": [
            "snap6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            6
          ],
          "destination": [
            "snap6",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap6",
            0
          ],
          "destination": [
            "pack",
            6
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            7
          ],
          "destination": [
            "snap7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            7
          ],
          "destination": [
            "snap7",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap7",
            0
          ],
          "destination": [
            "pack",
            7
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            8
          ],
          "destination": [
            "snap8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            8
          ],
          "destination": [
            "snap8",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap8",
            0
          ],
          "destination": [
            "pack",
            8
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            9
          ],
          "destination": [
            "snap9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            9
          ],
          "destination": [
            "snap9",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap9",
            0
          ],
          "destination": [
            "pack",
            9
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            10
          ],
          "destination": [
            "snap10",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            10
          ],
          "destination": [
            "snap10",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap10",
            0
          ],
          "destination": [
            "pack",
            10
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            11
          ],
          "destination": [
            "snap11",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            11
          ],
          "destination": [
            "snap11",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap11",
            0
          ],
          "destination": [
            "pack",
            11
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            12
          ],
          "destination": [
            "snap12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            12
          ],
          "destination": [
            "snap12",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap12",
            0
          ],
          "destination": [
            "pack",
            12
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            13
          ],
          "destination": [
            "snap13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            13
          ],
          "destination": [
            "snap13",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap13",
            0
          ],
          "destination": [
            "pack",
            13
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            14
          ],
          "destination": [
            "snap14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            14
          ],
          "destination": [
            "snap14",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap14",
            0
          ],
          "destination": [
            "pack",
            14
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            15
          ],
          "destination": [
            "snap15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            15
          ],
          "destination": [
            "snap15",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap15",
            0
          ],
          "destination": [
            "pack",
            15
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            16
          ],
          "destination": [
            "snap16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            16
          ],
          "destination": [
            "snap16",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap16",
            0
          ],
          "destination": [
            "pack",
            16
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            17
          ],
          "destination": [
            "snap17",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            17
          ],
          "destination": [
            "snap17",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap17",
            0
          ],
          "destination": [
            "pack",
            17
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            18
          ],
          "destination": [
            "snap18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            18
          ],
          "destination": [
            "snap18",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap18",
            0
          ],
          "destination": [
            "pack",
            18
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            19
          ],
          "destination": [
            "snap19",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            19
          ],
          "destination": [
            "snap19",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap19",
            0
          ],
          "destination": [
            "pack",
            19
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            20
          ],
          "destination": [
            "snap20",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            20
          ],
          "destination": [
            "snap20",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap20",
            0
          ],
          "destination": [
            "pack",
            20
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            21
          ],
          "destination": [
            "snap21",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            21
          ],
          "destination": [
            "snap21",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap21",
            0
          ],
          "destination": [
            "pack",
            21
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            22
          ],
          "destination": [
            "snap22",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            22
          ],
          "destination": [
            "snap22",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap22",
            0
          ],
          "destination": [
            "pack",
            22
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "analysis",
            23
          ],
          "destination": [
            "snap23",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trig",
            23
          ],
          "destination": [
            "snap23",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap23",
            0
          ],
          "destination": [
            "pack",
            23
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file0",
            0
          ],
          "destination": [
            "context",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file0",
            0
          ],
          "destination": [
            "spectral",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live0",
            0
          ],
          "destination": [
            "context",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live0",
            0
          ],
          "destination": [
            "spectral",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file1",
            0
          ],
          "destination": [
            "context",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "file1",
            0
          ],
          "destination": [
            "spectral",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live1",
            0
          ],
          "destination": [
            "context",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "live1",
            0
          ],
          "destination": [
            "spectral",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "poll",
            0
          ],
          "destination": [
            "context-trigger",
            0
          ],
          "order": 1
        }
      },
      {
        "patchline": {
          "source": [
            "context-pack",
            0
          ],
          "destination": [
            "context-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context",
            0
          ],
          "destination": [
            "context-snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-trigger",
            0
          ],
          "destination": [
            "context-snap0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-snap0",
            0
          ],
          "destination": [
            "context-pack",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context",
            1
          ],
          "destination": [
            "context-snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-trigger",
            1
          ],
          "destination": [
            "context-snap1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-snap1",
            0
          ],
          "destination": [
            "context-pack",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context",
            2
          ],
          "destination": [
            "context-snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-trigger",
            2
          ],
          "destination": [
            "context-snap2",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-snap2",
            0
          ],
          "destination": [
            "context-pack",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context",
            3
          ],
          "destination": [
            "context-snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-trigger",
            3
          ],
          "destination": [
            "context-snap3",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-snap3",
            0
          ],
          "destination": [
            "context-pack",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context",
            4
          ],
          "destination": [
            "context-snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-trigger",
            4
          ],
          "destination": [
            "context-snap4",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "context-snap4",
            0
          ],
          "destination": [
            "context-pack",
            4
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "poll",
            0
          ],
          "destination": [
            "spectral",
            2
          ],
          "order": 0
        }
      },
      {
        "patchline": {
          "source": [
            "spectral",
            0
          ],
          "destination": [
            "spectral-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "spectral-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dsp-state",
            1
          ],
          "destination": [
            "sr-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "sr-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dsp-state",
            1
          ],
          "destination": [
            "spectral-rate",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "spectral-rate",
            0
          ],
          "destination": [
            "spectral",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vst",
            3
          ],
          "destination": [
            "vsttag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vsttag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fx",
            0
          ],
          "destination": [
            "vst",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fx",
            0
          ],
          "destination": [
            "dry0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-dry",
            0
          ],
          "destination": [
            "dry0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vst",
            0
          ],
          "destination": [
            "wet0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-wet",
            0
          ],
          "destination": [
            "wet0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dry0",
            0
          ],
          "destination": [
            "mg0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wet0",
            0
          ],
          "destination": [
            "mg0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "master",
            0
          ],
          "destination": [
            "mg0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mg0",
            0
          ],
          "destination": [
            "guard0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "guard0",
            0
          ],
          "destination": [
            "mon0",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "monitor",
            0
          ],
          "destination": [
            "mon0",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mon0",
            0
          ],
          "destination": [
            "dac",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "guard0",
            0
          ],
          "destination": [
            "recorder",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fx",
            1
          ],
          "destination": [
            "vst",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fx",
            1
          ],
          "destination": [
            "dry1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-dry",
            0
          ],
          "destination": [
            "dry1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "vst",
            1
          ],
          "destination": [
            "wet1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-wet",
            0
          ],
          "destination": [
            "wet1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "dry1",
            0
          ],
          "destination": [
            "mg1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "wet1",
            0
          ],
          "destination": [
            "mg1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "master",
            0
          ],
          "destination": [
            "mg1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mg1",
            0
          ],
          "destination": [
            "guard1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "guard1",
            0
          ],
          "destination": [
            "mon1",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "monitor",
            0
          ],
          "destination": [
            "mon1",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "mon1",
            0
          ],
          "destination": [
            "dac",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "guard1",
            0
          ],
          "destination": [
            "recorder",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "guard0",
            0
          ],
          "destination": [
            "peak",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "peak",
            0
          ],
          "destination": [
            "peak-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "peak-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "record-dialog",
            0
          ],
          "destination": [
            "record-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "record-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "input-info",
            0
          ],
          "destination": [
            "input-menu",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ports-refresh",
            0
          ],
          "destination": [
            "inminus",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "inminus",
            0
          ],
          "destination": [
            "input-info",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "input-info",
            0
          ],
          "destination": [
            "input-seen",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "input-seen",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "input-menu",
            1
          ],
          "destination": [
            "input-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "input-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "output-info",
            0
          ],
          "destination": [
            "output-menu",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "ports-refresh",
            1
          ],
          "destination": [
            "output-info",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "output-info",
            0
          ],
          "destination": [
            "output-seen",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "output-seen",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "output-menu",
            1
          ],
          "destination": [
            "output-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "output-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "midi-in",
            0
          ],
          "destination": [
            "midi-tag",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "midi-tag",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "controller",
            1
          ],
          "destination": [
            "lp-out",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "fx-panel",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-dialog",
            0
          ],
          "destination": [
            "plugin-path",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "plugin-path",
            0
          ],
          "destination": [
            "controller",
            0
          ]
        }
      }
    ],
    "autosave": 0
  }
}
