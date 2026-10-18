'use strict';

const asset = (project, file) => `/assets/actual/${project}/${file}`;

const projects = {
  india: {
    slug: 'india',
    sectionNumber: '01',
    projectName: 'India in Transition',
    title: 'Six ways of seeing a country in transition.',
    intro:
      'An editorial system for six ways of seeing India in transition, giving a complex story a clear sequence of entry points.',
    hero: {
      src: asset('india', 'cover-hero.jpg'),
      alt: 'Editorial cover image for India in Transition',
      caption: 'Cover / an editorial system for six ways of seeing India in transition',
    },
    metadata: [
      ['Focus', 'Editorial system'],
      ['Story', 'Six ways of seeing India in transition'],
      ['Sequence', 'Big picture / geography / synthesis / work system'],
    ],
    sequence: {
      eyebrow: 'India in Transition / editorial sequence',
      title: 'A complex story, given a clear route through.',
      copy: 'The work moves from the broad picture to geography, synthesis, a working system and a closing bridge without breaking the visual thread.',
    },
    beats: [
      {
        label: 'Big picture',
        title: 'Start with the broad picture.',
        copy: 'The big picture sets the scale for an editorial story about India in transition.',
        images: [
          {
            src: asset('india', 'big-picture.jpg'),
            alt: 'Big picture composition from India in Transition',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
      {
        label: 'Geography map',
        title: 'Make place part of the reading.',
        copy: 'The geography map gives the story a clear spatial frame and keeps the country in view.',
        images: [
          {
            src: asset('india', 'geography-map.jpg'),
            alt: 'Geography map composition from India in Transition',
            fit: 'contain',
            position: 'center',
          },
        ],
      },
      {
        label: 'Synthesis montage',
        title: 'Bring the threads into one field.',
        copy: 'The synthesis montage gathers the project’s visual evidence into a single editorial composition.',
        images: [
          {
            src: asset('india', 'synthesis-montage.jpg'),
            alt: 'Synthesis montage from India in Transition',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
      {
        label: 'Work system',
        title: 'Let the system hold across formats.',
        copy: 'Wide and tall work-system views show the editorial language working at more than one scale.',
        images: [
          {
            src: asset('india', 'work-system-wide.png'),
            alt: 'Wide work-system view from India in Transition',
            fit: 'cover',
            position: 'center',
          },
          {
            src: asset('india', 'work-system-tall.png'),
            alt: 'Tall work-system view from India in Transition',
            fit: 'contain',
            position: 'center',
          },
        ],
      },
      {
        label: 'Closing bridge',
        title: 'Close by carrying the story forward.',
        copy: 'The closing bridge leaves the sequence open, with the editorial system still connecting the parts.',
        images: [
          {
            src: asset('india', 'closing-bridge.jpg'),
            alt: 'Closing bridge composition from India in Transition',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
    ],
    closing: {
      title: 'A clear sequence makes room for complexity.',
      copy: 'India in Transition turns a wide subject into an editorial route that can be entered, followed and remembered.',
    },
    previous: { label: 'V5.1 opening', href: '/v5.1/' },
    next: { label: 'Rotavirus', href: '/v5.1/projects/rotavirus/' },
  },

  rotavirus: {
    slug: 'rotavirus',
    sectionNumber: '02',
    projectName: 'Rotavirus',
    title: 'A public-health story built for attention.',
    intro:
      'An information-design case study that turns a public-health story into a clear visual sequence.',
    hero: {
      src: asset('rotavirus', 'cover.jpg'),
      alt: 'Cover image for the Rotavirus information-design case study',
      caption: 'Cover / information design for a public-health story',
    },
    metadata: [
      ['Focus', 'Information design'],
      ['Story', 'Public-health story'],
      ['Sequence', 'Overview / visual system / key takeaways'],
    ],
    sequence: {
      eyebrow: 'Rotavirus / information-design sequence',
      title: 'Build the story so the important parts stay visible.',
      copy: 'The case study moves from project overview to a visual system archive, then to key takeaways and a closing frame.',
    },
    beats: [
      {
        label: 'Project overview',
        title: 'Open with the project in view.',
        copy: 'The overview establishes the information-design approach before the details arrive.',
        images: [
          {
            src: asset('rotavirus', 'overview.jpg'),
            alt: 'Project overview image from the Rotavirus case study',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
      {
        label: 'Visual system archive',
        title: 'Keep the visual system inspectable.',
        copy: 'The slide archive preserves the full vertical record of the visual system in one tall source image.',
        images: [
          {
            src: asset('rotavirus', 'slide-archive.jpg'),
            alt: 'Tall visual system archive from the Rotavirus case study',
            fit: 'contain',
            position: 'center',
          },
        ],
      },
      {
        label: 'Key takeaways',
        title: 'Leave the reader with the signal.',
        copy: 'The key-takeaways frame brings the public-health story back to its clearest points.',
        images: [
          {
            src: asset('rotavirus', 'takeaways.png'),
            alt: 'Key takeaways image from the Rotavirus case study',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
      {
        label: 'Closing frame',
        title: 'End with a frame that holds.',
        copy: 'The closing image gives the information-design story a final, readable point of emphasis.',
        images: [
          {
            src: asset('rotavirus', 'closing.jpg'),
            alt: 'Closing image from the Rotavirus case study',
            fit: 'cover',
            position: 'center',
          },
        ],
      },
    ],
    closing: {
      title: 'Information earns attention when the route is clear.',
      copy: 'Rotavirus uses visual structure to help a public-health story arrive with focus.',
    },
    previous: { label: 'India in Transition', href: '/v5.1/projects/india/' },
    next: { label: 'Simulanis Uno', href: '/v5.1/projects/uno/' },
  },

  uno: {
    slug: 'uno',
    sectionNumber: '03',
    projectName: 'Simulanis Uno',
    title: 'Industrial training for a safer, smarter tomorrow.',
    intro: 'Experience design for a unified industrial training platform.',
    hero: {
      src: asset('uno', 'case-study.jpg'),
      alt: 'Tall Simulanis Uno case-study strip showing the supplied 17-slide experience-design story',
      caption: '17-slide case-study strip / portrait sequence',
      kind: 'strip',
    },
    metadata: [
      ['Focus', 'Experience design'],
      ['Platform', 'Unified industrial training'],
      ['Format', '17-slide case-study strip'],
    ],
    sequence: {
      eyebrow: 'Simulanis Uno / case-study strip',
      title: 'One continuous strip, read as a sequence.',
      copy: 'The portrait strip carries the story from experience design to a unified platform in one continuous sequence.',
      kind: 'strip',
    },
    beats: [
      {
        label: 'Case-study opening',
        title: 'Begin with the experience-design frame.',
        copy: 'The strip opens the supplied case study as one continuous portrait source.',
      },
      {
        label: 'Industrial training',
        title: 'Keep the training context in view.',
        copy: 'The experience is positioned around industrial training for a safer, smarter tomorrow.',
      },
      {
        label: 'Unified platform',
        title: 'Follow the platform story down the strip.',
        copy: 'The tall source holds the unified platform story in one scrollable case-study sequence.',
      },
      {
        label: 'Closing line',
        title: 'Let the sequence close intact.',
        copy: 'The final section keeps the case-study sequence intact.',
      },
    ],
    closing: {
      title: 'A continuous strip can carry a complete direction.',
      copy: 'Simulanis Uno follows the portrait sequence through experience design, industrial training and a unified platform.',
    },
    previous: { label: 'Rotavirus', href: '/v5.1/projects/rotavirus/' },
    next: { label: 'V5.1 opening', href: '/v5.1/' },
  },
};

module.exports = Object.freeze(projects);
