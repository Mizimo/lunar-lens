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
      100,
      100,
      980,
      600
    ],
    "openinpresentation": 0,
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
          "id": "left",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            20,
            20,
            120,
            22
          ],
          "text": "fftin~ 1"
        }
      },
      {
        "box": {
          "id": "right",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 3,
          "patching_rect": [
            180,
            20,
            120,
            22
          ],
          "text": "fftin~ 2"
        }
      },
      {
        "box": {
          "id": "shape",
          "maxclass": "newobj",
          "numinlets": 5,
          "numoutlets": 55,
          "patching_rect": [
            20,
            90,
            280,
            22
          ],
          "text": "gen~ lens_spectral"
        }
      },
      {
        "box": {
          "id": "poll",
          "maxclass": "newobj",
          "numinlets": 0,
          "numoutlets": 1,
          "patching_rect": [
            380,
            20,
            90,
            22
          ],
          "text": "in 3"
        }
      },
      {
        "box": {
          "id": "route",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 2,
          "patching_rect": [
            380,
            60,
            130,
            22
          ],
          "text": "route bang"
        }
      },
      {
        "box": {
          "id": "trigger",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 55,
          "patching_rect": [
            380,
            90,
            580,
            22
          ],
          "text": "t b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b b"
        }
      },
      {
        "box": {
          "id": "pack",
          "maxclass": "newobj",
          "numinlets": 55,
          "numoutlets": 1,
          "patching_rect": [
            20,
            710,
            900,
            22
          ],
          "text": "pack f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f"
        }
      },
      {
        "box": {
          "id": "out",
          "maxclass": "newobj",
          "numinlets": 1,
          "numoutlets": 0,
          "patching_rect": [
            20,
            760,
            90,
            22
          ],
          "text": "out 1"
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
            160,
            100,
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
            140,
            160,
            100,
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
            260,
            160,
            100,
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
            380,
            160,
            100,
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
            500,
            160,
            100,
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
            620,
            160,
            100,
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
            740,
            160,
            100,
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
            860,
            160,
            100,
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
            20,
            230,
            100,
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
            140,
            230,
            100,
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
            260,
            230,
            100,
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
            380,
            230,
            100,
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
            500,
            230,
            100,
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
            620,
            230,
            100,
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
            740,
            230,
            100,
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
            860,
            230,
            100,
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
            20,
            300,
            100,
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
            140,
            300,
            100,
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
            260,
            300,
            100,
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
            380,
            300,
            100,
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
            500,
            300,
            100,
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
            620,
            300,
            100,
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
            740,
            300,
            100,
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
            860,
            300,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap24",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap25",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            140,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap26",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            260,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap27",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            380,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap28",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap29",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            620,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap30",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            740,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap31",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            860,
            370,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap32",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap33",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            140,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap34",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            260,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap35",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            380,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap36",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap37",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            620,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap38",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            740,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap39",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            860,
            440,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap40",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap41",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            140,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap42",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            260,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap43",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            380,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap44",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap45",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            620,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap46",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            740,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap47",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            860,
            510,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap48",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            20,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap49",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            140,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap50",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            260,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap51",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            380,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap52",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            500,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap53",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            620,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      },
      {
        "box": {
          "id": "snap54",
          "maxclass": "newobj",
          "numinlets": 2,
          "numoutlets": 1,
          "patching_rect": [
            740,
            580,
            100,
            22
          ],
          "text": "snapshot~"
        }
      }
    ],
    "lines": [
      {
        "patchline": {
          "source": [
            "left",
            0
          ],
          "destination": [
            "shape",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "left",
            1
          ],
          "destination": [
            "shape",
            1
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "right",
            0
          ],
          "destination": [
            "shape",
            2
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "right",
            1
          ],
          "destination": [
            "shape",
            3
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "left",
            2
          ],
          "destination": [
            "shape",
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
            "route",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            1
          ],
          "destination": [
            "shape",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "route",
            0
          ],
          "destination": [
            "trigger",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
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
            "trigger",
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
            "shape",
            24
          ],
          "destination": [
            "snap24",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            24
          ],
          "destination": [
            "snap24",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap24",
            0
          ],
          "destination": [
            "pack",
            24
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            25
          ],
          "destination": [
            "snap25",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            25
          ],
          "destination": [
            "snap25",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap25",
            0
          ],
          "destination": [
            "pack",
            25
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            26
          ],
          "destination": [
            "snap26",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            26
          ],
          "destination": [
            "snap26",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap26",
            0
          ],
          "destination": [
            "pack",
            26
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            27
          ],
          "destination": [
            "snap27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            27
          ],
          "destination": [
            "snap27",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap27",
            0
          ],
          "destination": [
            "pack",
            27
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            28
          ],
          "destination": [
            "snap28",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            28
          ],
          "destination": [
            "snap28",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap28",
            0
          ],
          "destination": [
            "pack",
            28
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            29
          ],
          "destination": [
            "snap29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            29
          ],
          "destination": [
            "snap29",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap29",
            0
          ],
          "destination": [
            "pack",
            29
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            30
          ],
          "destination": [
            "snap30",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            30
          ],
          "destination": [
            "snap30",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap30",
            0
          ],
          "destination": [
            "pack",
            30
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            31
          ],
          "destination": [
            "snap31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            31
          ],
          "destination": [
            "snap31",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap31",
            0
          ],
          "destination": [
            "pack",
            31
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            32
          ],
          "destination": [
            "snap32",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            32
          ],
          "destination": [
            "snap32",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap32",
            0
          ],
          "destination": [
            "pack",
            32
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            33
          ],
          "destination": [
            "snap33",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            33
          ],
          "destination": [
            "snap33",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap33",
            0
          ],
          "destination": [
            "pack",
            33
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            34
          ],
          "destination": [
            "snap34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            34
          ],
          "destination": [
            "snap34",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap34",
            0
          ],
          "destination": [
            "pack",
            34
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            35
          ],
          "destination": [
            "snap35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            35
          ],
          "destination": [
            "snap35",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap35",
            0
          ],
          "destination": [
            "pack",
            35
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            36
          ],
          "destination": [
            "snap36",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            36
          ],
          "destination": [
            "snap36",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap36",
            0
          ],
          "destination": [
            "pack",
            36
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            37
          ],
          "destination": [
            "snap37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            37
          ],
          "destination": [
            "snap37",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap37",
            0
          ],
          "destination": [
            "pack",
            37
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            38
          ],
          "destination": [
            "snap38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            38
          ],
          "destination": [
            "snap38",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap38",
            0
          ],
          "destination": [
            "pack",
            38
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            39
          ],
          "destination": [
            "snap39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            39
          ],
          "destination": [
            "snap39",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap39",
            0
          ],
          "destination": [
            "pack",
            39
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            40
          ],
          "destination": [
            "snap40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            40
          ],
          "destination": [
            "snap40",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap40",
            0
          ],
          "destination": [
            "pack",
            40
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            41
          ],
          "destination": [
            "snap41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            41
          ],
          "destination": [
            "snap41",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap41",
            0
          ],
          "destination": [
            "pack",
            41
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            42
          ],
          "destination": [
            "snap42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            42
          ],
          "destination": [
            "snap42",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap42",
            0
          ],
          "destination": [
            "pack",
            42
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            43
          ],
          "destination": [
            "snap43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            43
          ],
          "destination": [
            "snap43",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap43",
            0
          ],
          "destination": [
            "pack",
            43
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            44
          ],
          "destination": [
            "snap44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            44
          ],
          "destination": [
            "snap44",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap44",
            0
          ],
          "destination": [
            "pack",
            44
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            45
          ],
          "destination": [
            "snap45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            45
          ],
          "destination": [
            "snap45",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap45",
            0
          ],
          "destination": [
            "pack",
            45
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            46
          ],
          "destination": [
            "snap46",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            46
          ],
          "destination": [
            "snap46",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap46",
            0
          ],
          "destination": [
            "pack",
            46
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            47
          ],
          "destination": [
            "snap47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            47
          ],
          "destination": [
            "snap47",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap47",
            0
          ],
          "destination": [
            "pack",
            47
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            48
          ],
          "destination": [
            "snap48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            48
          ],
          "destination": [
            "snap48",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap48",
            0
          ],
          "destination": [
            "pack",
            48
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            49
          ],
          "destination": [
            "snap49",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            49
          ],
          "destination": [
            "snap49",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap49",
            0
          ],
          "destination": [
            "pack",
            49
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            50
          ],
          "destination": [
            "snap50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            50
          ],
          "destination": [
            "snap50",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap50",
            0
          ],
          "destination": [
            "pack",
            50
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            51
          ],
          "destination": [
            "snap51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            51
          ],
          "destination": [
            "snap51",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap51",
            0
          ],
          "destination": [
            "pack",
            51
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            52
          ],
          "destination": [
            "snap52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            52
          ],
          "destination": [
            "snap52",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap52",
            0
          ],
          "destination": [
            "pack",
            52
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            53
          ],
          "destination": [
            "snap53",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            53
          ],
          "destination": [
            "snap53",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap53",
            0
          ],
          "destination": [
            "pack",
            53
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "shape",
            54
          ],
          "destination": [
            "snap54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "trigger",
            54
          ],
          "destination": [
            "snap54",
            0
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "snap54",
            0
          ],
          "destination": [
            "pack",
            54
          ]
        }
      },
      {
        "patchline": {
          "source": [
            "pack",
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
  }
}
