import React from 'react';

const AcalaLogo = React.lazy(() => import('./acala.svg'));
const AusdLogo = React.lazy(() => import('./ausd.svg'));
const DotLogo = React.lazy(() => import('./dot.svg'));
const LdotLogo = React.lazy(() => import('./ldot.svg'));
const LcdotLogo = React.lazy(() => import('./lcdot.svg'));
const AltairLogo = React.lazy(() => import('./altair.svg'));
const CloverLogo = React.lazy(() => import('./clover.svg'));
const CrabLogo = React.lazy(() => import('./crab.svg'));
const CrustLogo = React.lazy(() => import('./crust.svg'));
const EfinityLogo = React.lazy(() => import('./efinity.svg'));
const EquilibriumLogo = React.lazy(() => import('./equilibrium.svg'));
const GenshiroLogo = React.lazy(() => import('./genshiro.svg'));
const HydradxLogo = React.lazy(() => import('./hydradx.svg'));
const IntegriteeLogo = React.lazy(() => import('./integritee.svg'));
const InterlayLogo = React.lazy(() => import('./interlay.svg'));
const KaruraLogo = React.lazy(() => import('./karura.svg'));
const KusamaLogo = React.lazy(() => import('./kusama.svg'));
const MantaLogo = React.lazy(() => import('./manta.svg'));
const DolphinLogo = React.lazy(() => import('./dolphin.svg'));
const MoonriverLogo = React.lazy(() => import('./moonriver.svg'));
const ParallelLogo = React.lazy(() => import('./parallel.svg'));
const PhalaLogo = React.lazy(() => import('./phala.svg'));
const PicassoLogo = React.lazy(() => import('./picasso.svg'));
const PolkadotLogo = React.lazy(() => import('./polkadot.svg'));
const SakuraLogo = React.lazy(() => import('./sakura.svg'));
const ShadowLogo = React.lazy(() => import('./shadow.svg'));
const SoraLogo = React.lazy(() => import('./sora-substrate.svg'));
const StatemineLogo = React.lazy(() => import('./statemine.svg'));
const SubgameLogo = React.lazy(() => import('./subgame.svg'));
const SubsocialLogo = React.lazy(() => import('./subsocial.svg'));
const KoniLogo = React.lazy(() => import('./koni.svg'));
const WestendLogo = React.lazy(() => import('./westend.svg'));
const RobonomicsLogo = React.lazy(() => import('./robonomics.svg'));
const OdysseyLogo = React.lazy(() => import('./odyssey.svg'));
const AlephLogo = React.lazy(() => import('./aleph.svg'));
const BitcountryLogo = React.lazy(() => import('./bitcountry.svg'));
const UniqueLogo = React.lazy(() => import('./unique.network.svg'));
const BncLogo = React.lazy(() => import('./bnc.svg'));
const KusdLogo = React.lazy(() => import('./kusd.svg'));
const LksmLogo = React.lazy(() => import('./lksm.svg'));
const TaiLogo = React.lazy(() => import('./tai.svg'));
const VsksmLogo = React.lazy(() => import('./vsksm.svg'));
const MangataxLogo = React.lazy(() => import('./mangatax.svg'));
const ChainxLogo = React.lazy(() => import('./chainx.svg'));
const EncointerLogo = React.lazy(() => import('./encointer.svg'));
const BtcLogo = React.lazy(() => import('./btc.svg'));
const EthLogo = React.lazy(() => import('./eth.svg'));
const BnbLogo = React.lazy(() => import('./bnb.svg'));
const UsdtLogo = React.lazy(() => import('./usdt.svg'));
const UsdcLogo = React.lazy(() => import('./usdc.svg'));
const BusdLogo = React.lazy(() => import('./busd.svg'));
const ShibLogo = React.lazy(() => import('./shib.svg'));
const DaiLogo = React.lazy(() => import('./dai.svg'));
const WbtcLogo = React.lazy(() => import('./wbtc.svg'));
const GlintLogo = React.lazy(() => import('./glint.svg'));
const StellaLogo = React.lazy(() => import('./stella.svg'));
const BillLogo = React.lazy(() => import('./bill.svg'));
const BifrostLogo = React.lazy(() => import('./bifrost.svg'));
const DefaultLogo = React.lazy(() => import('./default.svg'));

export const SvgLogosMap = {
  acala: AcalaLogo,
  acala_testnet: AcalaLogo,
  ausd: AusdLogo,
  dot: DotLogo,
  ldot: LdotLogo,
  lcdot: LcdotLogo,
  altair: AltairLogo,
  bifrost: BifrostLogo,
  bifrost_testnet: BifrostLogo,
  clover: CloverLogo,
  crab: CrabLogo,
  crust: CrustLogo,
  efinity: EfinityLogo,
  equilibrium_parachain: EquilibriumLogo,
  genshiro: GenshiroLogo,
  genshiro_testnet: GenshiroLogo,
  hydradx: HydradxLogo,
  integritee: IntegriteeLogo,
  interlay: InterlayLogo,
  karura: KaruraLogo,
  kusama: KusamaLogo,
  manta: MantaLogo,
  dolphin: DolphinLogo,
  parallel: ParallelLogo,
  phala: PhalaLogo,
  picasso: PicassoLogo,
  polkadot: PolkadotLogo,
  sakura: SakuraLogo,
  shadow: ShadowLogo,
  'sora-substrate': SoraLogo,
  statemine: StatemineLogo,
  subgame: SubgameLogo,
  statemint: StatemineLogo,
  subsocial_x: SubsocialLogo,
  subsocial: SubsocialLogo,
  koni: KoniLogo,
  westend: WestendLogo,
  robonomics: RobonomicsLogo,
  odyssey: OdysseyLogo,
  aleph: AlephLogo,
  alephTest: AlephLogo,
  bitcountry: BitcountryLogo,
  unique_network: UniqueLogo,
  pha: PhalaLogo,
  bnc: BncLogo,
  kusd: KusdLogo,
  lksm: LksmLogo,
  tai: TaiLogo,
  vsksm: VsksmLogo,
  ksm: KusamaLogo,
  kar: KaruraLogo,
  mangatax: MangataxLogo,
  mangatax_para: MangataxLogo,
  chainx: ChainxLogo,
  encointer: EncointerLogo,
  btc: BtcLogo,
  eth: EthLogo,
  bnb: BnbLogo,
  usdt: UsdtLogo,
  usdc: UsdcLogo,
  busd: BusdLogo,
  shib: ShibLogo,
  dai: DaiLogo,
  wbtc: WbtcLogo,
  weth: EthLogo,
  glint: GlintLogo,
  share: GlintLogo,
  stella: StellaLogo,
  movr: MoonriverLogo,
  bill: BillLogo,
  xcksm: KusamaLogo,
  xckar: KaruraLogo,
  xcbnc: BifrostLogo,
  xcausd: AusdLogo,
  default: DefaultLogo,
};

export const ImageLogosMap = {
  astar: require('./astar.png'),
  astarEvm: require('./astar.png'),
  basilisk: require('./basilisk.png'),
  calamari: require('./calamari.png'),
  centrifuge: require('./centrifuge.png'),
  coinversation: require('./coinversation.png'),
  composableFinance: require('./composableFinance.png'),
  darwinia: require('./darwinia.png'),
  edgeware: require('./edgeware.png'),
  heiko: require('./heiko.png'),
  kilt: require('./kilt.png'),
  kintsugi: require('./kintsugi.png'),
  kintsugi_test: require('./kintsugi.png'),
  litentry: require('./litentry.png'),
  moonbeam: require('./moonbeam.png'),
  pichiu: require('./pichiu.png'),
  pioneer: require('./pioneer.png'),
  quartz: require('./quartz.png'),
  shiden: require('./shiden.png'),
  shidenEvm: require('./shiden.png'),
  zeitgeist: require('./zeitgeist.png'),
  opal: require('./opal.png'),
  moonbase: require('./moonbase.png'),
  kbtc: require('./kbtc.png'),
  kint: require('./kint.png'),
  zlk: require('./zenlink.png'),
  neumann: require('./oak_network.png'),
  turing: require('./turing.png'),
  litmus: require('./litmus.png'),
  pkex: require('./pkex.png'),
  sdn: require('./shiden.png'),
  jpyc: require('./jpyc.png'),
  beans: require('./beans.png'),
  xstella: require('./xstella.png'),
  vesolar: require('./flare.png'),
  flare: require('./flare.png'),
  mfam: require('./mfam.png'),
  solar: require('./solar.png'),
  frax: require('./frax.png'),
  fxs: require('./frax.png'),
  cws: require('./cws.png'),
  rib: require('./rib.png'),
  csg: require('./csg.png'),
  qtz: require('./quartz.png'),
  csm: require('./csm.png'),
  aris: require('./aris.png'),
  kico: require('./kico.png'),
  hko: require('./hko.png'),
  rococo: require('./rococo.png'),
  nodle: require('./nodle.png'),
  moonriver: require('./moonriver.png'),
  khala: require('./khala.png'),
  polkadex: require('./polkadex.png'),
  xckint: require('./kintsugi.png'),
  chrwna: require('./chrwna.png'),
  rmrk: require('./rmrk.jpg'),
  ukraine: require('./ukraine.jpg'),
  xcrmrk: require('./rmrk.jpg'),
  chaos: require('./chaosdao.jpeg'),
};
